import { useDispatch, useSelector } from 'react-redux';
import { Octokit } from '@octokit/rest';
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
import { Dispatch } from '../../store';

type TokenSets = {
  [key: string]: AnyTokenSet;
};

/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getCreatePullRequestUrl(id: string, branchName: string) {
  return `https://github.com/${id}/compare/${branchName}?expand=1`;
}

function hasSameContent(content: TokenValues, storedContent: string) {
  const stringifiedContent = JSON.stringify(content.values, null, 2);

  return stringifiedContent === storedContent;
}

export const fetchGithubBranches = async ({
  secret, owner, repo, baseUrl,
}: { secret: string, owner: string, repo: string, baseUrl: string | undefined }) => {
  const octokit = new Octokit({ auth: secret, baseUrl });
  const branches = await octokit.repos
    .listBranches({ owner, repo })
    .then((response) => response.data);
  return branches.map((branch) => branch.name);
};

export const createGithubBranch = async ({
  context, branch, startBranch,
}: { context: ContextObject, branch: string, startBranch: string }) => {
  const { id, secret, baseUrl } = context;
  const [owner, repo] = id.split('/');
  const octokit = new Octokit({ auth: secret, baseUrl });
  const originRef = `heads/${startBranch}`;
  const newRef = `refs/heads/${branch}`;

  const originBranch = await octokit.rest.git.getRef({ owner, repo, ref: originRef });
  const newBranch = await octokit.rest.git.createRef({
    owner, repo, ref: newRef, sha: originBranch.data.object.sha,
  });
  console.log('new', newBranch);
  return newBranch;
};

export const checkPermissions = async ({ context, owner, repo }: { context: ContextObject, owner: string, repo: string }) => {
  try {
    const octokit = new Octokit({ auth: context.secret, baseUrl: context.baseUrl });

    const currentUser = await octokit.rest.users.getAuthenticated();

    if (!currentUser.data.login) return null;

    const permissions = await octokit.rest.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username: currentUser.data.login,
    });

    return permissions;
  } catch (e) {
    console.log(e);

    return null;
  }
};

function getTreeMode(type: 'dir' | 'file') {
  switch (type) {
    case 'dir':
      return '040000';
    default:
      return '100644';
  }
}

export const readContents = async ({
  context, owner, repo, opts,
}: { context: ContextObject, owner: string, repo: string, opts: FeatureFlagOpts }) => {
  const octokit = new Octokit({ auth: context.secret, baseUrl: context.baseUrl });
  let response;

  try {
    response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: context.filePath,
      ref: context.branch,
    });

    const fileContents: Array<{ name: string; data: string }> = [];
    if (Array.isArray(response.data) && opts.multiFile) {
      const folderResponse = await octokit.rest.git.createTree({
        owner,
        repo,
        tree: response.data.map((item) => ({ path: item.path, sha: item.sha, mode: getTreeMode(item.type) })),
      });
      if (folderResponse.data.tree[0].sha) {
        const treeResponse = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: folderResponse.data.tree[0].sha,
          recursive: 'true',
        });
        if (treeResponse.data.tree.length > 0) {
          await Promise.all(
            treeResponse.data.tree
              .filter((i) => i.path?.endsWith('.json'))
              .map((treeItem) => {
                if (treeItem.path) {
                  return octokit.rest.repos
                    .getContent({
                      owner,
                      repo,
                      path: `${context.filePath}/${treeItem.path}`,
                      ref: context.branch,
                    })
                    .then((res) => {
                      if (!Array.isArray(res.data) && 'content' in res.data && treeItem.path) {
                        fileContents.push({ name: treeItem.path.replace('.json', ''), data: decodeBase64(res.data.content) });
                      }
                    });
                }
                return null;
              }),
          );
        }
      }

      if (fileContents.length > 0) {
        // If we receive multiple files, parse each
        // sort by name (as we can't guarantee order)
        const allContents = fileContents
          .sort((a, b) => a.name.localeCompare(b.name))
          .reduce((acc, curr) => {
            if (IsJSONString(curr.data)) {
              const parsed = JSON.parse(curr.data);

              acc[curr.name] = parsed;
            }
            return acc;
          }, {});
        return allContents ? { values: allContents } : null;
      }
    } else if ('content' in response.data) {
      const data = decodeBase64(response.data.content);
      // If content of file is parseable JSON, parse it
      if (IsJSONString(data)) {
        const parsed = JSON.parse(data);
        return {
          values: parsed,
        };
      }
    }
    // If not, return null as we can't process that file. We should let the user know, though.
    return null;
  } catch (e) {
    // Raise error (usually this is an auth error)
    console.log('Error', e);
    return null;
  }
};

type FeatureFlagOpts = {
  multiFile: boolean;
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

export function useGitHub() {
  const tokens = useSelector(tokensSelector);
  const localApiState = useSelector(localApiStateSelector);
  const featureFlags = useSelector(featureFlagsSelector);
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  async function askUserIfPull(): Promise<boolean> {
    const { result } = await confirm({
      text: 'Pull from GitHub?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return result;
  }

  function getTokenObj() {
    const raw = convertTokensToObject(tokens);
    const string = JSON.stringify(raw, null, 2);
    return { raw, string };
  }

  async function writeTokensToGitHub({
    context,
    tokenObj,
    owner,
    repo,
    commitMessage,
    customBranch,
  }: {
    context: ContextObject;
    tokenObj: TokenSets;
    owner: string;
    repo: string;
    commitMessage?: string;
    customBranch?: string;
  }): Promise<TokenValues | null> {
    try {
      const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
      const octokit = new OctokitWithPlugin({ auth: context.secret, baseUrl: context.baseUrl });

      const { secret, baseUrl } = context;
      const branches = await fetchGithubBranches({
        secret, owner, repo, baseUrl,
      });
      const branch = customBranch || context.branch;
      if (!branches) return null;
      let response;

      if (branches.includes(branch)) {
        response = await createOrUpdateFiles(
          octokit,
          {
            owner,
            repo,
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
            owner,
            repo,
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
      notifyToUI('Pushed changes to GitHub');
      return response;
    } catch (e) {
      notifyToUI('Error pushing to GitHub', { error: true });
      console.log('Error pushing to GitHub', e);
    }
    return null;
  }

  async function pushTokensToGitHub(context: ContextObject) {
    const { raw: rawTokenObj, string: tokenObj } = getTokenObj();
    const [owner, repo] = context.id.split('/');

    const content = await readContents({
      context,
      owner,
      repo,
      opts: { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
    });

    if (content) {
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
        await writeTokensToGitHub({
          context,
          tokenObj: rawTokenObj,
          owner,
          repo,
          commitMessage,
          customBranch,
        });
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch });
        dispatch.uiState.setApiData({ ...context, branch: customBranch });

        pushDialog('success');
      } catch (e) {
        console.log('Error pushing to GitHub', e);
      }
    }
    return rawTokenObj;
  }

  async function checkAndSetAccess({ context, owner, repo }: { context: ContextObject; owner: string; repo: string }) {
    const hasWriteAccess = await checkPermissions({ context, owner, repo });
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }

  async function pullTokensFromGitHub(context: ContextObject, receivedFeatureFlags?: FeatureFlags) {
    const multiFile = receivedFeatureFlags ? receivedFeatureFlags.gh_mfs_enabled : featureFlags?.gh_mfs_enabled;

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({ context, owner, repo });

    try {
      const content = await readContents({
        context,
        owner,
        repo,
        opts: { multiFile: Boolean(multiFile) },
      });

      if (content) {
        return content;
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  }

  // Function to initially check auth and sync tokens with GitHub
  async function syncTokensWithGitHub(context: ContextObject): Promise<TokenValues | null> {
    try {
      const { id, secret, baseUrl } = context;
      const [owner, repo] = id.split('/');
      const branches = await fetchGithubBranches({
        secret, owner, repo, baseUrl,
      });
      dispatch.branchState.setBranches(branches);

      if (!branches) {
        return null;
      }

      const content = await pullTokensFromGitHub(context);

      const { string: tokenObj } = getTokenObj();

      if (content) {
        if (!hasSameContent(content, tokenObj)) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            dispatch.tokenState.setLastSyncedState(JSON.stringify(content.values, null, 2));
            dispatch.tokenState.setTokenData(content);
            notifyToUI('Pulled tokens from GitHub');
            return content;
          }
          return { values: tokenObj };
        }
        return content;
      }
      return await pushTokensToGitHub(context);
    } catch (e) {
      notifyToUI('Error syncing with GitHub, check credentials', { error: true });
      console.log('Error', e);
      return null;
    }
  }

  async function addNewGitHubCredentials(context: ContextObject): Promise<TokenValues | null> {
    let { raw: rawTokenObj } = getTokenObj();

    const data = await syncTokensWithGitHub(context);

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
  }
  return {
    addNewGitHubCredentials,
    syncTokensWithGitHub,
    pullTokensFromGitHub,
    pushTokensToGitHub,
  };
}
