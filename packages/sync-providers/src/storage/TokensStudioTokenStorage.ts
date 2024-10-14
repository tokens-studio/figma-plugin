import {
  Graphql,
  Configuration,
  CreateTokenMutation,
  UpdateTokenMutation,
  DeleteTokenMutation,
  CreateTokenSetMutation,
  UpdateTokenSetMutation,
  DeleteTokenSetMutation,
  ProjectQuery,
  UpdateTokenSetOrderMutation,
  ThemeGroup,
  TokenSet,
  UpdateThemeGroupMutation,
  CreateThemeGroupMutation,
  DeleteThemeGroupMutation,
  TokenInput,
} from '@tokens-studio/sdk';
import * as Sentry from '@sentry/react';
import { AnyTokenSet } from '@/types/tokens';
// import { notifyToUI } from '@/plugin/notifiers';
import {
  RemoteTokenStorage,
  RemoteTokenstorageErrorMessage,
  RemoteTokenStorageFile,
  RemoteTokenStorageMetadata,
} from './RemoteTokenStorage';
import { ErrorMessages } from '../constants/ErrorMessages';
import { SaveOption } from './FileTokenStorage';
// import { TokensStudioAction } from '@/app/store/providers/tokens-studio';
import {
  GET_PROJECT_DATA_QUERY,
  CREATE_TOKEN_MUTATION,
  UPDATE_TOKEN_MUTATION,
  DELETE_TOKEN_MUTATION,
  CREATE_TOKEN_SET_MUTATION,
  UPDATE_TOKEN_SET_MUTATION,
  DELETE_TOKEN_SET_MUTATION,
  UPDATE_TOKEN_SET_ORDER_MUTATION,
  UPDATE_THEME_GROUP_MUTATION,
  CREATE_THEME_GROUP_MUTATION,
  DELETE_THEME_GROUP_MUTATION,
} from './tokensStudio/graphql';
// import { track } from '@/utils/analytics';
import { ThemeObjectsList } from '@/types';
import { TokenTypes } from '@/constants/TokenTypes';
import { tokensStudioToToken } from './tokensStudio/utils';
import { TokensStudioAction } from './tokensStudio/createTokenInTokensStudio';

export type TokensStudioSaveOptions = {
  commitMessage?: string;
};

type ProjectData = {
  tokens: AnyTokenSet | null | undefined;
  themes: ThemeObjectsList;
  tokenSets: {
    [tokenSetName: string]: { id: string };
  };
  tokenSetOrder: string[];
};

async function getProjectData(urn: string): Promise<ProjectData | null> {
  try {
    const data = await Graphql.exec<ProjectQuery>(
      Graphql.op(GET_PROJECT_DATA_QUERY, {
        urn,
      }),
    );

    if (!data.data?.project) {
      return null;
    }

    const tokenSets = data.data.project.sets as TokenSet[];

    const returnData = tokenSets.reduce(
      (acc, tokenSet) => {
        if (!tokenSet.name) return acc;
        acc.tokens[tokenSet.name] = tokenSet.tokens.reduce((tokenSetAcc, token) => {
          // We know that name exists (required field)
          tokenSetAcc[token.name!] = tokensStudioToToken(token);
          return tokenSetAcc;
        }, {});

        acc.tokenSets[tokenSet.name] = { id: tokenSet.urn, isDynamic: tokenSet.type === 'DYNAMIC' };

        return acc;
      },
      { tokens: {}, tokenSets: {} },
    );

    const tokenSetOrder = tokenSets
      .sort((a, b) => (+(a.orderIndex || 0) > +(b.orderIndex || 0) ? 1 : -1))
      .reduce((acc: string[], tokenSet) => {
        if (!tokenSet.name) return acc;
        return [...acc, tokenSet.name];
      }, []);

    let themes = [] as ThemeObjectsList;
    const themeGroups = data.data.project.themeGroups as ThemeGroup[];

    if (themeGroups) {
      themeGroups.forEach(({ name: group, urn: groupUrn, options }) => {
        if (!options) {
          return;
        }

        const figmaThemes: ThemeObjectsList = options
          ?.filter((theme) => !!theme)
          .map((theme) => {
            const selectedTokenSets = JSON.parse(JSON.parse(theme?.selectedTokenSets || '')) || [];

            return {
              id: theme?.urn as string,
              name: theme?.name as string,
              group,
              groupId: groupUrn,
              selectedTokenSets,
              $figmaStyleReferences: JSON.parse(JSON.parse(theme?.figmaStyleReferences || '{}')),
              $figmaVariableReferences: JSON.parse(JSON.parse(theme?.figmaVariableReferences || '{}')),
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

  constructor(id: string, secret: string) {
    super();
    this.id = id;
    this.secret = secret;
    // Note: there seems to be an issue with "Admin" API keys not being able to access resources currently, for now this won't work.
    Configuration.setAPIKey(secret);
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    let tokens: AnyTokenSet | null | undefined = {};
    let themes: ThemeObjectsList = [];
    const metadata: RemoteTokenStorageMetadata = {};

    try {
      const projectData = await getProjectData(this.id);

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
  }: {
    action: TokensStudioAction;
    data: any;
    metadata?: RemoteTokenStorageMetadata['tokenSetsData'];
  }) {
    switch (action) {
      case 'CREATE_TOKEN': {
        try {
          const setId = metadata?.[data.parent]?.id;

          if (!setId) {
            throw new Error('Invalid data');
          }

          const input: TokenInput = {
            name: data.name,
            type: data.type,
            description: data.description,
            extensions: JSON.stringify(data.$extensions),
          };

          if (data.type === TokenTypes.BOX_SHADOW) {
            input.boxShadow = data.value;
          } else if (data.type === TokenTypes.BORDER) {
            input.border = data.value;
          } else if (data.type === TokenTypes.TYPOGRAPHY) {
            input.typography = data.value;
          } else if (data.type === TokenTypes.COMPOSITION) {
            input.composition = data.value;
          } else {
            input.value = data.value;
          }

          const responseData = await Graphql.exec<CreateTokenMutation>(
            Graphql.op(CREATE_TOKEN_MUTATION, {
              set: setId,
              input,
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Create token in Tokens Studio');
          // notifyToUI('Token pushed to Tokens Studio', { error: false });
          // onPushTokenSuccess()

          return responseData.data.createToken;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error creating token in Tokens Studio', e);
          return null;
        }
      }
      case 'EDIT_TOKEN': {
        const tokenId = data.$extensions?.['studio.tokens']?.urn;

        if (!tokenId) {
          throw new Error('Invalid data');
        }

        try {
          const valueIsString = typeof data.value === 'string';
          const isComplexTokenType = [
            TokenTypes.BOX_SHADOW,
            TokenTypes.BORDER,
            TokenTypes.TYPOGRAPHY,
            TokenTypes.COMPOSITION,
          ].includes(data.type);

          const input = {
            name: data.name,
            description: data.description,
            extensions: JSON.stringify(data.$extensions),
            value: undefined,
          };

          if (isComplexTokenType && !valueIsString) {
            input[data.type.toLowerCase()] = data.value;
          } else {
            input.value = data.value;
          }

          const responseData = await Graphql.exec<UpdateTokenMutation>(
            Graphql.op(UPDATE_TOKEN_MUTATION, {
              urn: tokenId,
              input,
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Edit token in Tokens Studio');
          // notifyToUI('Token updated in Tokens Studio', { error: false });
          // onUpdateTokenSuccess()

          return responseData.data.updateToken;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error updating token in Tokens Studio', e);
          return null;
        }
      }
      case 'DELETE_TOKEN': {
        if (!data.sourceId) {
          throw new Error('Invalid data');
        }

        try {
          const responseData = await Graphql.exec<DeleteTokenMutation>(
            Graphql.op(DELETE_TOKEN_MUTATION, {
              urn: data.sourceId,
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Delete token from Tokens Studio');
          // notifyToUI('Token removed from Tokens Studio', { error: false });
          // onTokenRemoveSuccess();

          return responseData.data.deleteToken;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error removing token from Tokens Studio', e);
          return null;
        }
      }
      case 'CREATE_TOKEN_SET': {
        try {
          if (!data.name) {
            throw new Error('Invalid data');
          }

          const responseData = await Graphql.exec<CreateTokenSetMutation>(
            Graphql.op(CREATE_TOKEN_SET_MUTATION, {
              project: this.id,
              input: {
                name: data.name,
              },
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Create token set in Tokens Studio');
          // notifyToUI('Token set added in Tokens Studio', { error: false });
          // onTokenSetAddSuccess();

          return responseData.data.createTokenSet;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error creating token set in Tokens Studio', e);
          return null;
        }
      }
      case 'UPDATE_TOKEN_SET': {
        try {
          const setId = metadata?.[data.oldName]?.id;

          if (!setId || !data.newName) {
            throw new Error('Invalid data');
          }

          const responseData = await Graphql.exec<UpdateTokenSetMutation>(
            Graphql.op(UPDATE_TOKEN_SET_MUTATION, {
              urn: setId,
              input: {
                name: data.newName,
              },
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Update token set in Tokens Studio');
          // notifyToUI('Token set updated in Tokens Studio', { error: false });
          // onTokenSetUpdateSuccess()

          return responseData.data.updateTokenSet;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error updating token set in Tokens Studio', e);
          return null;
        }
      }
      case 'DELETE_TOKEN_SET': {
        try {
          const setId = metadata?.[data.name]?.id;

          if (!setId) {
            throw new Error('Invalid data');
          }

          const responseData = await Graphql.exec<DeleteTokenSetMutation>(
            Graphql.op(DELETE_TOKEN_SET_MUTATION, {
              urn: setId,
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Delete token set in Tokens Studio');
          // notifyToUI('Token set deleted from Tokens Studio', { error: false });
          // onDeleteTokenSetSuccess()

          return responseData.data.deleteTokenSet;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error deleting token set in Tokens Studio', e);
          return null;
        }
      }
      case 'UPDATE_TOKEN_SET_ORDER': {
        try {
          const responseData = await Graphql.exec<UpdateTokenSetOrderMutation>(
            Graphql.op(UPDATE_TOKEN_SET_ORDER_MUTATION, {
              input: data,
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Update token set order in Tokens Studio');
          // notifyToUI('Token set order updated in Tokens Studio', { error: false });
          // onTokenSetOrderUpdateSuccess()

          return responseData.data.updateTokenSetOrder;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error updating token set order in Tokens Studio', e);
          return null;
        }
      }
      case 'CREATE_THEME_GROUP': {
        try {
          const responseData = await Graphql.exec<CreateThemeGroupMutation>(
            Graphql.op(CREATE_THEME_GROUP_MUTATION, {
              project: this.id,
              input: {
                name: data.name,
                options: data.options,
              },
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Create theme group in Tokens Studio');
          // notifyToUI('Theme group created in Tokens Studio', { error: false });
          // onThemeGroupCreateSuccess()

          return responseData.data.createThemeGroup;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error creating theme group in Tokens Studio', e);
          return null;
        }
      }
      case 'UPDATE_THEME_GROUP': {
        try {
          const responseData = await Graphql.exec<UpdateThemeGroupMutation>(
            Graphql.op(UPDATE_THEME_GROUP_MUTATION, {
              urn: data.groupId,
              input: {
                name: data.name,
                options: data.options,
              },
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Update theme group in Tokens Studio');
          // notifyToUI('Theme group updated in Tokens Studio', { error: false });
          // onThemeGroupUpdateSuccess()

          return responseData.data.updateThemeGroup;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error updating theme group in Tokens Studio', e);
          return null;
        }
      }
      case 'DELETE_THEME_GROUP': {
        try {
          const responseData = await Graphql.exec<DeleteThemeGroupMutation>(
            Graphql.op(DELETE_THEME_GROUP_MUTATION, {
              urn: data.groupId,
            }),
          );

          if (!responseData.data) {
            return null;
          }

          // track('Delete theme group in Tokens Studio');
          // notifyToUI('Theme group deleted from Tokens Studio', { error: false });
          // onThemeGroupDeleteSuccess();
          return responseData.data.deleteThemeGroup;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error deleting theme group in Tokens Studio', e);
          return null;
        }
      }
      default:
        throw new Error(`Unimplemented storage provider for ${action}`);
    }
  }
}
