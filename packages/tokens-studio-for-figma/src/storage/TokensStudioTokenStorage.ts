import {
  PaginatedSets,
  ThemeGroup, TokenSetType, TokensSet, create,
} from '@tokens-studio/sdk';
import * as Sentry from '@sentry/react';
import { AnyTokenSet } from '@/types/tokens';
import { notifyToUI } from '@/plugin/notifiers';
import {
  RemoteTokenStorage,
  RemoteTokenstorageErrorMessage,
  RemoteTokenStorageFile,
  RemoteTokenStorageMetadata,
} from './RemoteTokenStorage';
import { ErrorMessages } from '../constants/ErrorMessages';
import { SaveOption } from './FileTokenStorage';
import {
  GET_PROJECT_DATA_QUERY,
  CREATE_TOKEN_SET_MUTATION,
  DELETE_THEME_GROUP_MUTATION,
  UPDATE_THEME_GROUP_MUTATION,
  CREATE_THEME_GROUP_MUTATION,
  UPDATE_TOKEN_SET_MUTATION,
  DELETE_TOKEN_SET_MUTATION,
  UPDATE_TOKEN_SET_ORDER_MUTATION,
} from './tokensStudio/graphql';
import { track } from '@/utils/analytics';
import { ThemeObjectsList } from '@/types';
import { TokensStudioAction } from '@/app/store/providers/tokens-studio';
import { GET_TOKEN_SET_PAGE } from './tokensStudio/graphql/getTokenSetsQuery';

const DEFAULT_BRANCH = 'main';

const makeClient = (secret: string) => create({
  host: process.env.TOKENS_STUDIO_API_HOST ?? 'localhost:4200',
  secure: !!process.env.SECURE_API,
  auth: `Bearer ${secret}`,
});

export type TokensStudioSaveOptions = {
  commitMessage?: string;
};

type ProjectData = {
  tokens: AnyTokenSet | null | undefined;
  themes: ThemeObjectsList;
  tokenSets: {
    [tokenSetName: string]: { isDynamic: boolean };
  };
  tokenSetOrder: string[];
};

export async function getAllTokenSets(
  id: string,
  orgId: string,
  client: ReturnType<typeof create>,
  branch = DEFAULT_BRANCH,
): Promise<TokensSet[]> {

  console.trace(branch);
  const data = await client.query({
    query: GET_TOKEN_SET_PAGE,
    variables: {
      projectId: id,
      organization: orgId,
      branch,
      page: 1,
    },
  });

  if (!data.data?.project?.branch) {
    return [];
  }

  const paginatedData = data.data.project.branch.tokenSets as PaginatedSets;

  const page1Data = data.data.project.branch.tokenSets.data as TokensSet[];

  // +1 to account from non zero index, another +1 to account for the first page
  const pageIndices = Array.from(
    { length: paginatedData.totalPages - 1 },
    (_, i) => i + 2,
  );

  const remainingPages = await Promise.all(
    pageIndices.map(async (page) => {
      const data = await client.query({
        query: GET_TOKEN_SET_PAGE,
        variables: {
          projectId: id,
          organization: orgId,
          name: "main",
          page,
        },
      });
      return data.data.project.branch.tokenSets.data as TokensSet[];
    }),
  );

  return [...page1Data, ...remainingPages.flat()];
}

async function getProjectData(id: string, orgId: string, client: ReturnType<typeof create>, branch = DEFAULT_BRANCH): Promise<ProjectData | null> {
  try {
    const [projectData, tokenSets] = await Promise.all([
      client.query({
        query: GET_PROJECT_DATA_QUERY,
        variables: {
          projectId: id,
          organization: orgId,
          branch,
        },
      }),
      getAllTokenSets(id, orgId, client),
    ]);

    if (!projectData.data?.project?.branch) {
      return null;
    }

    const returnData = tokenSets.reduce(
      (acc, tokenSet) => {
        if (!tokenSet.name) return acc;
        acc.tokens[tokenSet.name] = JSON.parse(JSON.stringify(tokenSet.raw));
        acc.tokenSets[tokenSet.name] = { isDynamic: tokenSet.type === TokenSetType.Dynamic };
        return acc;
      },
      { tokens: {}, tokenSets: {} },
    );

    // sort by orderIndex
    const tokenSetOrder = [...tokenSets]
      .sort((a, b) => (+(a.orderIndex || 0) > +(b.orderIndex || 0) ? 1 : -1))
      .map((tokenSet) => tokenSet.name);

    let themes = [] as ThemeObjectsList;
    const themeGroups = projectData.data.project.branch.themeGroups.data as ThemeGroup[];

    if (themeGroups) {
      themeGroups.forEach(({ name: group, options }) => {
        if (!options) {
          return;
        }

        const figmaThemes: ThemeObjectsList = options
          ?.filter((theme) => !!theme)
          .map((theme) => {
            const selectedTokenSets = theme?.selectedTokenSets;

            return {
              id: theme.id,
              name: theme?.name,
              group,
              selectedTokenSets,
              $figmaStyleReferences: theme?.figmaStyleReferences,
              $figmaVariableReferences: theme?.figmaVariableReferences,
              $figmaCollectionId: theme?.figmaCollectionId ?? undefined,
              $figmaModeId: theme?.figmaModeId ?? undefined,
            };
          });

        themes = [...themes, ...figmaThemes];
      });
    }

    return { ...returnData, tokenSetOrder, themes };
  } catch (e) {
    Sentry.captureException(e);
    console.error('Error fetching tokens', e);
    return null;
  }
}

export class TokensStudioTokenStorage extends RemoteTokenStorage<TokensStudioSaveOptions, SaveOption> {
  private id: string;

  private secret: string;

  private orgId: string;

  private client: any;

  public actionsQueue: any[];

  public processQueueTimeout: NodeJS.Timeout | null;

  constructor(id: string, orgId: string, secret: string) {
    super();
    this.id = id;
    this.orgId = orgId;
    this.secret = secret;
    this.client = makeClient(secret);
    this.actionsQueue = [];
    this.processQueueTimeout = null;
  }

  public setContext(id: string, orgId: string, secret: string) {
    this.id = id;
    this.orgId = orgId;
    this.secret = secret;
    this.client = makeClient(secret);
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    let tokens: AnyTokenSet | null | undefined = {};
    let themes: ThemeObjectsList = [];
    const metadata: RemoteTokenStorageMetadata = {};

    try {
      const projectData = await getProjectData(this.id, this.orgId, this.client);

      tokens = projectData?.tokens;
      themes = projectData?.themes || [];

      if (projectData?.tokenSets) {
        metadata.tokenSetsData = projectData.tokenSets;
      }

      if (projectData?.tokenSetOrder) {
        metadata.tokenSetOrder = projectData.tokenSetOrder;
      }
    } catch (error) {
      // We get errors in a slightly changed format from the backend
      if (tokens?.errors) console.log('Error is', tokens.errors[0].message);
      return {
        errorMessage: tokens?.errors ? tokens.errors[0].message : ErrorMessages.TOKENSSTUDIO_CREDENTIAL_ERROR,
      };
    }
    if (tokens) {
      // @ts-ignore typescript is giving me a great friday morning
      const returnPayload: RemoteTokenStorageFile[] = Object.entries(tokens).map(([filename, data]) => ({
        name: filename,
        type: 'tokenSet',
        path: filename,
        data,
      }));

      if (themes) {
        returnPayload.push({
          type: 'themes',
          path: 'themes',
          data: themes,
        });
      }

      if (metadata) {
        returnPayload.push({
          type: 'metadata',
          path: 'metadata',
          data: metadata,
        });
      }

      return returnPayload;
    }
    return {
      errorMessage: ErrorMessages.TOKENSSTUDIO_READ_ERROR,
    };
  }

  public async write(
    // TODO: Add write support
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    files: RemoteTokenStorageFile<TokensStudioSaveOptions>[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    saveOptions?: SaveOption | undefined,
  ): Promise<boolean> {
    console.log('WRITE NOT IMPLEMENTED', files, saveOptions);
    return undefined as any;
  }

  public async push({
    action,
    data,
    metadata,
    successCallback,
  }: {
    action: TokensStudioAction;
    data: any;
    metadata?: RemoteTokenStorageMetadata['tokenSetsData'];
    successCallback?: () => void;
  }) {
    this.actionsQueue.push({
      action,
      data,
      metadata,
      successCallback,
    });

    if (this.processQueueTimeout) {
      clearTimeout(this.processQueueTimeout);
    }

    this.processQueueTimeout = setTimeout(this.processQueue.bind(this), 100);
  }

  private async handleCreateTokenSet(data: any, successCallback: () => void) {
    try {
      if (!data.name) {
        throw new Error('Invalid data');
      }
      // TODO: export the type for the mutation from sdk
      const responseData = await this.client.mutate({
        mutation: CREATE_TOKEN_SET_MUTATION,
        variables: {
          project: this.id,
          organization: this.orgId,
          input: {
            path: data.name,
            orderIndex: data.orderIndex,
          },
        },
      });

      if (!responseData?.data) {
        throw new Error('No response data');
      }

      track('Create token set in Tokens Studio');
      notifyToUI('Token set added in Tokens Studio', { error: false });

      successCallback?.();
    } catch (e) {
      Sentry.captureException(e);
      console.error('Error creating token set in Tokens Studio', e);
    }
  }

  private async handleUpdateTokenSet(data: any, successCallback: () => void) {
    try {
      const responseData = await this.client.mutate({
        mutation: UPDATE_TOKEN_SET_MUTATION,
        variables: {
          project: this.id,
          organization: this.orgId,
          input: {
            path: data.oldName || data.name,
            newPath: data.newName,
            raw: data.raw,
          },
        },
      });

      if (!responseData.data) {
        throw new Error('No response data');
      }

      track('Update token set in Tokens Studio');
      notifyToUI('Token set updated in Tokens Studio', { error: false });

      successCallback?.();
    } catch (e) {
      Sentry.captureException(e);
      notifyToUI(`Error updating following token set in Tokens Studio: ${data.oldName || data.name}`, {
        error: true,
      });
      console.error('Error updating token set in Tokens Studio', e);
    }
  }

  private async handleDeleteTokenSet(data: any, successCallback: () => void) {
    try {
      if (!data.name) {
        throw new Error('Invalid data');
      }

      const responseData = await this.client.mutate({
        mutation: DELETE_TOKEN_SET_MUTATION,
        variables: {
          branch: DEFAULT_BRANCH,
          path: data.name,
          project: this.id,
          organization: this.orgId,
        },
      });

      if (!responseData.data) {
        throw new Error('No response data');
      }

      track('Delete token set in Tokens Studio');
      notifyToUI('Token set deleted from Tokens Studio', { error: false });

      successCallback?.();
    } catch (e) {
      Sentry.captureException(e);
      console.error('Error deleting token set in Tokens Studio', e);
    }
  }

  private async handleUpdateTokenSetOrder(data: any, successCallback: () => void) {
    try {
      const responseData = await this.client.mutate({
        mutation: UPDATE_TOKEN_SET_ORDER_MUTATION,
        variables: {
          updates: data,
          project: this.id,
          organization: this.orgId,
        },
      });

      if (!responseData.data) {
        throw new Error('No response data');
      }

      track('Update token set order in Tokens Studio');
      notifyToUI('Token set order updated in Tokens Studio', { error: false });

      successCallback?.();
    } catch (e) {
      Sentry.captureException(e);
      console.error('Error updating token set order in Tokens Studio', e);
    }
  }

  private async handleCreateThemeGroup(data: any, successCallback: () => void) {
    try {
      const responseData = await this.client.mutate({
        mutation: CREATE_THEME_GROUP_MUTATION,
        variables: {
          input: {
            name: data.name,
            options: data.options,
          },
          project: this.id,
          organization: this.orgId,
          branch: DEFAULT_BRANCH,
        },
      });

      if (!responseData.data) {
        throw new Error('No response data');
      }

      track('Create theme group in Tokens Studio');
      notifyToUI('Theme group created in Tokens Studio', { error: false });

      successCallback?.();
    } catch (e) {
      Sentry.captureException(e);
      console.error('Error creating theme group in Tokens Studio', e);
    }
  }

  private async handleUpdateThemeGroup(data: any, successCallback: () => void) {
    try {
      const responseData = await this.client.mutate({
        mutation: UPDATE_THEME_GROUP_MUTATION,
        variables: {
          input: {
            name: data.name,
            ...(data.newName && { newName: data.newName }),
            options: data.options,
          },
          project: this.id,
          organization: this.orgId,
        },
      });

      if (!responseData.data) {
        throw new Error('No response data');
      }

      track('Update theme group in Tokens Studio');
      notifyToUI('Theme group updated in Tokens Studio', { error: false });

      successCallback?.();
    } catch (e) {
      Sentry.captureException(e);
      console.error('Error updating theme group in Tokens Studio', e);
    }
  }

  private async handleDeleteThemeGroup(data: any, successCallback: () => void) {
    try {
      const responseData = await this.client.mutate({
        mutation: DELETE_THEME_GROUP_MUTATION,
        variables: {
          branch: DEFAULT_BRANCH,
          themeGroupName: data.name,
          project: this.id,
          organization: this.orgId,
        },
      });

      if (!responseData.data) {
        throw new Error('No response data');
      }

      track('Delete theme group in Tokens Studio');
      notifyToUI('Theme group deleted from Tokens Studio', { error: false });

      successCallback?.();
    } catch (e) {
      Sentry.captureException(e);
      console.error('Error deleting theme group in Tokens Studio', e);
    }
  }

  private async processQueue() {
    const actionsToProcess = [...this.actionsQueue];
    this.actionsQueue = [];
    this.processQueueTimeout = null;

    for (const actionToProcess of actionsToProcess) {
      const { action, data, successCallback } = actionToProcess;

      switch (action) {
        case 'CREATE_TOKEN_SET':
          await this.handleCreateTokenSet(data, successCallback);
          break;
        case 'UPDATE_TOKEN_SET':
          await this.handleUpdateTokenSet(data, successCallback);
          break;
        case 'DELETE_TOKEN_SET':
          await this.handleDeleteTokenSet(data, successCallback);
          break;
        case 'UPDATE_TOKEN_SET_ORDER':
          await this.handleUpdateTokenSetOrder(data, successCallback);
          break;
        case 'CREATE_THEME_GROUP':
          await this.handleCreateThemeGroup(data, successCallback);
          break;
        case 'UPDATE_THEME_GROUP':
          await this.handleUpdateThemeGroup(data, successCallback);
          break;
        case 'DELETE_THEME_GROUP':
          await this.handleDeleteThemeGroup(data, successCallback);
          break;
        default:
          throw new Error(`Unimplemented storage provider for ${action}`);
      }
    }
  }
}

