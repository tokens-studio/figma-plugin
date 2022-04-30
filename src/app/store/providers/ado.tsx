import { useDispatch, useSelector } from 'react-redux';
import * as azdev from 'azure-devops-node-api';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import { Dispatch, RootState } from '@/app/store';
import { MessageToPluginTypes } from '@/types/messages';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import IsJSONString from '@/utils/isJSONString';
import { ContextObject } from '@/types/api';
import { notifyToUI, postToFigma } from '../../../plugin/notifiers';
import { FeatureFlags } from '@/utils/featureFlags';
import { AnyTokenSet, TokenValues } from '@/types/tokens';
import { decodeBase64 } from '@/utils/string';
import { featureFlagsSelector, localApiStateSelector, tokensSelector } from '@/selectors';

// export function getADOCreatePullRequestUrl(id: string, branchName: string) {
//   return `https://github.com/${id}/compare/${branchName}?expand=1`;
// }

/**
 * https://github.com/Microsoft/azure-devops-node-api
 import * as azdev from "azure-devops-node-api";

// your collection url
let orgUrl = "https://dev.azure.com/yourorgname";

let token: string = process.env.AZURE_PERSONAL_ACCESS_TOKEN;

let authHandler = azdev.getPersonalAccessTokenHandler(token);
let connection = new azdev.WebApi(orgUrl, authHandler);

Project: needs to replace name in the gitform
and Repository should be a url
 */

interface GetADOCreatePullRequestUrl {
  (args: {
    branch?: string
    orgUrl?: string
    projectName?: string
    repoName?: string
  }): string
}

type FeatureFlagOpts = {
  multiFile: boolean;
};

type TokenSets = {
  [key: string]: AnyTokenSet;
};

export const getADOCreatePullRequestUrl: GetADOCreatePullRequestUrl = (args) => {
  const {
    branch,
    orgUrl,
    projectName,
    repoName,
  } = args;
  return `${orgUrl}/${projectName}{/_git/${repoName}/pullrequestcreate?sourceRef=&targetRef=${branch}`;
};

export const getWebApi = async (context: ContextObject) => {
  const authHandler = azdev.getPersonalAccessTokenHandler(context.secret);
  return new azdev.WebApi(context.baseUrl || '', authHandler);
};

export const getGitApi = async (context: ContextObject): Promise<GitApi.IGitApi> => {
  const webApi = await getWebApi(context);
  const gitApi = await webApi.getGitApi();
  return gitApi;
};

export const checkPermissions = async (context: ContextObject) => {
  try {
    const webApi = await getWebApi(context);
    await webApi.connect();
    return true;
  } catch (err) {
    return false;
  }
};

const checkAndSetAccess = async (context: ContextObject, dispatch: Dispatch) => {
  const hasWriteAccess = await checkPermissions(context);
  dispatch.tokenState.setEditProhibited(!hasWriteAccess);
};

const fetchContent = async (context: ContextObject, filePath?: string): Promise<[
  { values: any },
  string,
]> => {
  const git = await getGitApi(context);
  try {
    const { content, path } = await git.getItem(
      context.id,
      filePath || context.filePath,
      context.name,
      undefined,
      undefined,
      false,
      false,
      false,
      {
        version: context.branch,
        versionType: GitInterfaces.GitVersionType.Branch,
      },
      true,
      false,
      false,
    );
    if (content && IsJSONString(content)) {
      const parsed = JSON.parse(content);
      return [
        { values: parsed },
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
    const git = await getGitApi(context);
    const result = await git.getItems(
      context.id,
      context.filePath,
      context.name,
      GitInterfaces.VersionControlRecursionType.Full,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        version: context.branch,
        versionType: GitInterfaces.GitVersionType.Branch,
      },
    );
    const filePaths = result.reduce<string[]>((acc: string[], cur: GitInterfaces.GitItem) => {
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
// START HERE

const hasSameContent = (content: TokenValues, storedContent: string) => {
  const stringifiedContent = JSON.stringify(content.values, null, 2);

  return stringifiedContent === storedContent;
};

export const fetchBranches = async ({ context, owner, repo }: { context: ContextObject, owner: string, repo: string }) => {
  const octokit = new Octokit({ auth: context.secret, baseUrl: context.baseUrl });
  const branches = await octokit.repos
    .listBranches({ owner, repo })
    .then((response) => response.data);
  return branches.map((branch) => branch.name);
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

const createOrUpdateFiles = (
  octokit,
  context: {
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
    tokenObj: TokenSets;
    createNewBranch: boolean;
    commitMessage?: string;
  },
  opts: FeatureFlagOpts,
) => {
  const files = extractFiles(context.filePath, context.tokenObj, opts);

  return octokit.repos.createOrUpdateFiles({
    owner: context.owner,
    repo: context.repo,
    branch: context.branch,
    createBranch: context.createNewBranch,
    changes: [{ message: context.commitMessage || 'Commit from Figma', files }],
  });
};

// STOP

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

  // START HERE

  const writeTokensToADO = async ({
    context,
    tokenObj,
    commitMessage,
    customBranch,
  }: {
    context: ContextObject;
    tokenObj: TokenSets;
    commitMessage?: string;
    customBranch?: string;
  }): Promise<TokenValues | null> => {
    try {
      const webApi = await getWebApi(context);
      const gitApi = await webApi.getGitApi();

      const branches = await fetchBranches({ context, owner, repo });
      const branch = customBranch || context.branch;
      if (!branches) return null;
      let response;

      if (branches.includes(branch)) {
        response = await createOrUpdateFiles(
          gitApi,
          {
            branch,
            filePath: context.filePath,
            tokenObj,
            createNewBranch: false,
            commitMessage: commitMessage || 'Commit from Figma',
          },
          { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
        );
      } else {
        response = await createOrUpdateFiles(
          octokit,
          {
            branch,
            filePath: context.filePath,
            tokenObj,
            createNewBranch: true,
            commitMessage: commitMessage || 'Commit from Figma',
          },
          { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
        );
      }
      dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenObj, null, 2));
      notifyToUI('Pushed changes to ADO');
      return response;
    } catch (e) {
      notifyToUI('Error pushing to ADO', { error: true });
      console.log('Error pushing to ADO', e);
    }
    return null;
  };

  // STOP HERE

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

  const pullTokensFromADO = async (context: ContextObject, receivedFeatureFlags?: FeatureFlags | undefined): Promise<{
    values: any;
  } | null> => {
    const multiFile = receivedFeatureFlags ? receivedFeatureFlags.gh_mfs_enabled : featureFlags?.gh_mfs_enabled;

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
      const [owner, repo] = context.id.split('/');
      const hasBranches = await fetchBranches({ context, owner, repo });

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
