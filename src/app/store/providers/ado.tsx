import { useDispatch, useSelector } from 'react-redux';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import { Dispatch } from '@/app/store';
import { MessageToPluginTypes } from '@/types/messages';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { ContextObject } from '@/types/api';
import { notifyToUI, postToFigma } from '../../../plugin/notifiers';
import { FeatureFlags } from '@/utils/featureFlags';
import { AnyTokenSet, TokenValues } from '@/types/tokens';
import { featureFlagsSelector, localApiStateSelector, tokensSelector } from '@/selectors';

type FeatureFlagOpts = {
  multiFile: boolean;
};

type TokenSets = {
  [key: string]: AnyTokenSet;
};

interface GetADOCreatePullRequestUrl {
  (args: {
    branch?: string
    orgUrl?: string
    projectId?: string
    repositoryId?: string
  }): string
}

export const getADOCreatePullRequestUrl: GetADOCreatePullRequestUrl = ({
  branch,
  orgUrl,
  projectId,
  repositoryId,
}) => `${orgUrl}/${projectId ? `${projectId}/` : ''}/_git/${repositoryId}/pullrequestcreate?sourceRef=&targetRef=${branch}`;

interface FetchGit {
  body?: Record<string, any>
  gitResource: 'refs' | 'items' | 'pushes'
  token: string
  orgUrl?: string
  params?: Record<string, string | boolean | Record<string, string | boolean>>
  projectId?:string
  repositoryId: string
}

const fetchGit = async ({
  body,
  gitResource,
  orgUrl,
  params,
  projectId,
  repositoryId,
  token,
}: FetchGit): Promise<Record<string, any>> => {
  const apiVersion = 'api-version=7.1-preview.1';
  const paramString = params
    ? [...Object.entries(params).map(([key, value]) => `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`), apiVersion].join('&')
    : apiVersion;

  const formattedBody = body ? { body: JSON.stringify(body) } : {};
  return fetch(
    `${orgUrl}/${projectId ? `${projectId}/` : ''}_apis/git/repositories/${repositoryId}/${gitResource}?${paramString}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${window.btoa(`:${token}`)}`,
      },
      ...formattedBody,
    },
  );
};

const checkAndSetAccess = async (context: ContextObject, dispatch: Dispatch) => {
  const { status } = await fetchGit({
    gitResource: 'refs',
    orgUrl: context.baseUrl,
    params: {
      filter: 'heads',
    },
    projectId: context.name,
    repositoryId: context.id,
    token: context.secret,
  });
  dispatch.tokenState.setEditProhibited(status === 200);
};

type GitApiArgs = Pick<FetchGit, 'body' | 'params'>;
type GitItemsArgs = {
  filePath: string
  branch: string
};
type GitApiMethods = {
  getItems(args: GitItemsArgs): Promise<{ count: number, value: GitInterfaces.GitItem[] }>;
  getItem(args: GitItemsArgs): Promise<Record<string, any>>
  getRefs(args: GitApiArgs): Promise<GitInterfaces.GitRef[]>;
  getPushes(args: GitApiArgs): Promise<GitInterfaces.GitPush>;
};
export const getGitApi = (context: ContextObject): GitApiMethods => {
  const itemsDefault: Omit<FetchGit, 'body' | 'params'> = {
    gitResource: 'items',
    orgUrl: context.baseUrl,
    projectId: context.name,
    repositoryId: context.id,
    token: context.secret,
  };
  return ({
    async getItem(args) {
      const response = await fetchGit({
        ...itemsDefault,
        params: {
          path: args.filePath,
          versionDescriptor: {
            version: args.branch,
            versionType: 'branch',
          },
          includeContent: true,
        },
      });
      if (response.status !== 200) {
        return undefined;
      }
      return response.json();
    },
    async getItems({ filePath, branch }) {
      const response = await fetchGit({
        ...itemsDefault,
        params: {
          scopePath: filePath.replace(/\.json$/, ''),
          recursionLevel: 'full',
          versionDescriptor: {
            version: branch,
            versionType: 'branch',
          },
        },
      });
      return response.json();
    },
    async getRefs(args: GitApiArgs) {
      const response = await fetchGit({
        body: args.body,
        gitResource: 'refs',
        orgUrl: context.baseUrl,
        params: args.params,
        projectId: context.name,
        repositoryId: context.id,
        token: context.secret,
      });
      return response.json();
    },
    async getPushes(args: GitApiArgs) {
      const response = await fetchGit({
        body: args.body,
        gitResource: 'pushes',
        orgUrl: context.baseUrl,
        params: args.params,
        projectId: context.name,
        repositoryId: context.id,
        token: context.secret,
      });
      return response.json();
    },
  });
};

const fetchContent = async (context: ContextObject, filePath?: string): Promise<[
  { values: any },
  string,
]> => {
  const gitApi = getGitApi(context);
  try {
    const path = filePath || context.filePath;
    const content = await gitApi.getItem({ filePath: path, branch: context.branch });
    if (content) {
      return [
        { values: content },
        path || '',
      ];
    }
    return [{ values: {} }, ''];
  } catch (e) {
    // Raise error (usually this is an auth error)
    console.log('Error', e);
    return [{ values: {} }, ''];
  }
};

export const readContents = async ({ context, opts }: { context: ContextObject, opts: FeatureFlagOpts }): Promise<{
  values: any
}> => {
  if (opts.multiFile) {
    const gitApi = await getGitApi(context);
    const { value } = await gitApi.getItems({ filePath: context.filePath, branch: context.branch });
    const filePaths = value.reduce<string[]>((acc: string[], cur: GitInterfaces.GitItem) => {
      const { path } = cur;
      if (path?.endsWith('.json')) {
        acc.push(path);
      }
      return acc;
    }, []);
    if (filePaths.length) {
      const data = await Promise.all(
        filePaths.map(async (path) => {
          const res = await fetchContent(context, path);
          return res;
        }),
      );
      const tokens = data
        .sort(([, a], [, b]) => a.localeCompare(b))
        .reduce<{ values: any }>(
        (acc, [token]) => ({
          values: {
            ...acc.values,
            ...token.values,
          },
        }),
        { values: {} },
      );

      return tokens;
    }
  }
  const [tokens] = await fetchContent(context);
  return tokens;
};

const hasSameContent = (content: TokenValues, storedContent: string) => {
  const stringifiedContent = JSON.stringify(content.values, null, 2);

  return stringifiedContent === storedContent;
};

const extractFiles = (filePath: string, tokenObj: TokenSets, opts: FeatureFlagOpts) => {
  const files: { [key: string]: string } = {};
  if (filePath.endsWith('.json')) {
    files[filePath] = JSON.stringify(tokenObj, null, 2);
  } else if (opts.multiFile) {
    Object.keys(tokenObj).forEach((key) => {
      files[`${filePath}/${key}.json`] = JSON.stringify(tokenObj[key], null, 2);
    });
  }
  return files;
};

interface GetChanges {
  (args: {
    files: { [key: string]: string }
    value: GitInterfaces.GitItem[]
  }) : {
    changeType: GitInterfaces.VersionControlChangeType;
    item: {
      path: string;
    };
    newContent: {
      content: string;
      contentType: GitInterfaces.ItemContentType;
    };
  }[]
}

const getChanges: GetChanges = ({
  files,
  value,
}) => {
  const tokensOnRemote = value.reduce<Set<string>>((acc, { path }) => {
    if (path?.endsWith('.json')) {
      acc.add(path);
    }
    return acc;
  }, new Set());
  const changes = Object.entries(files)
    .map(([path, content]) => ({
      changeType: tokensOnRemote.has(path) ? GitInterfaces.VersionControlChangeType.Edit : GitInterfaces.VersionControlChangeType.Add,
      item: {
        path,
      },
      newContent: {
        content,
        contentType: GitInterfaces.ItemContentType.RawText,
      },
    }));
  return changes;
};

const getHeads = async (context: ContextObject) => {
  const gitApi = await getGitApi(context);
  return gitApi.getRefs({
    params: {
      filter: 'heads',
    },
  });
};

export const useADO = () => {
  const tokens = useSelector(tokensSelector);
  const localApiState = useSelector(localApiStateSelector);
  const featureFlags = useSelector(featureFlagsSelector);
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  const askUserIfPull = async (): Promise<boolean> => {
    const { result } = await confirm({
      text: 'Pull from ADO?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return result;
  };

  const getTokenObj = () => {
    const raw = convertTokensToObject(tokens);
    const string = JSON.stringify(raw, null, 2);
    return { raw, string };
  };

  const writeTokensToADO = async ({
    context,
    multiFile,
    tokenObj,
    commitMessage,
    customBranch,
  }: {
    context: ContextObject;
    multiFile: boolean;
    tokenObj: TokenSets;
    commitMessage?: string;
    customBranch?: string;
  }) => {
    const { id: repo, name: project } = context;
    try {
      const branches = await getHeads(context);
      const branch = customBranch || context.branch;
      if (!branches) return null;

      let oldObjectId;

      const newBranch = !branches.some(({ name, objectId }) => {
        if (name?.replace('refs/heads/', '') === branch) {
          oldObjectId = objectId;
          return true;
        }
        return false;
      });
      const gitApi = await getGitApi(context);
      if (newBranch) {
        const refs = await gitApi.getRefs(
          { params: { name: `refs/heads/${branch}`, repositoryId: repo, isLocked: false } },
        );
        oldObjectId = refs[0].objectId ?? oldObjectId;
      }

      const files = extractFiles(context.filePath, tokenObj, { multiFile });

      const { value } = await gitApi.getItems({ filePath: context.filePath, branch });
      const changes = getChanges({
        files,
        value,
      });
      const response = await gitApi.getPushes({
        body: {
          refUpdates: [
            {
              name: `refs/heads/${branch}`,
              oldObjectId,
            },
          ],
          commits: [
            {
              comment: commitMessage || 'Commit from Figma',
              changes,
            },
          ],
        },
      });
      dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenObj, null, 2));
      notifyToUI('Pushed changes to ADO');
      return response;
    } catch (e) {
      notifyToUI('Error pushing to ADO', { error: true });
      console.log('Error pushing to ADO', e);
    }
    return null;
  };

  const pushTokensToADO = async (context: ContextObject): Promise<{}> => {
    const { raw: rawTokenObj, string: tokenObj } = getTokenObj();

    const content = await readContents({
      context,
      opts: { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
    });

    if (Object.keys(content.values).length) {
      if (content && hasSameContent(content, tokenObj)) {
        notifyToUI('Nothing to commit');
        return rawTokenObj;
      }
    }

    dispatch.uiState.setLocalApiState({ ...context });

    const pushSettings = await pushDialog();
    if (pushSettings) {
      const { commitMessage, customBranch } = pushSettings;
      try {
        await writeTokensToADO({
          multiFile: Boolean(featureFlags?.gh_mfs_enabled),
          context,
          tokenObj: rawTokenObj,
          commitMessage,
          customBranch,
        });
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch });
        dispatch.uiState.setApiData({ ...context, branch: customBranch });

        pushDialog('success');
      } catch (e) {
        console.log('Error pushing to ADO', e);
      }
    }
    return rawTokenObj;
  };

  const pullTokensFromADO = async (context: ContextObject, receivedFeatureFlags?: FeatureFlags | undefined):Promise<{
    values: any;
  } | null> => {
    const multiFile = receivedFeatureFlags ? receivedFeatureFlags.gh_mfs_enabled : featureFlags?.gh_mfs_enabled;
    if (!context.baseUrl) {
      return null;
    }
    await checkAndSetAccess(context, dispatch);

    try {
      const content = await readContents({
        context,
        opts: { multiFile: Boolean(multiFile) },
      });

      if (Object.keys(content.values).length) {
        return content;
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  };

  const syncTokensWithADO = async (context: ContextObject): Promise<TokenValues | null> => {
    try {
      const branches = await getHeads(context);
      const hasBranches = Boolean(branches.length);

      if (!hasBranches) {
        return null;
      }

      const content = await pullTokensFromADO(context);

      const { string: tokenObj } = getTokenObj();

      if (content) {
        if (!hasSameContent(content, tokenObj)) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            dispatch.tokenState.setLastSyncedState(JSON.stringify(content.values, null, 2));
            dispatch.tokenState.setTokenData(content);
            notifyToUI('Pulled tokens from ADO');
            return content;
          }
          return { values: tokenObj };
        }
        return content;
      }
      return await pushTokensToADO(context);
    } catch (e) {
      notifyToUI('Error syncing with ADO, check credentials', { error: true });
      console.log('Error', e);
      return null;
    }
  };

  const addNewADOCredentials = async (context: ContextObject): Promise<TokenValues | null> => {
    let { raw: rawTokenObj } = getTokenObj();

    const data = await syncTokensWithADO(context);

    if (data) {
      postToFigma({
        type: MessageToPluginTypes.CREDENTIALS,
        ...context,
      });
      if (data?.values) {
        dispatch.tokenState.setLastSyncedState(JSON.stringify(data.values, null, 2));
        dispatch.tokenState.setTokenData(data);
        rawTokenObj = data.values;
      } else {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      return null;
    }

    return {
      values: rawTokenObj,
    };
  };
  return ({
    addNewADOCredentials,
    syncTokensWithADO,
    pullTokensFromADO,
    pushTokensToADO,
  });
};
