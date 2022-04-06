import { useDispatch, useSelector } from 'react-redux';
import { Resources } from '@gitbeaker/core';
import { Gitlab } from '@gitbeaker/browser';
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

type TokenSets = {
  [key: string]: AnyTokenSet;
};

/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getCreatePullRequestUrl(id: string, branchName: string) {
  return `https://github.com/${id}/compare/${branchName}?expand=1`;
}

function getGitlabOptions(context: ContextObject) {
  const { secret, baseUrl } = context;

  if (baseUrl && baseUrl.length > 0) {
    return { token: secret, host: baseUrl };
  }
  return { token: secret };
}

function hasSameContent(content: TokenValues, storedContent: string) {
  const stringifiedContent = JSON.stringify(content.values, null, 2);

  return stringifiedContent === storedContent;
}

export const fetchBranches = async ({ context, owner, repo }: { context: ContextObject, owner: string, repo: string }) => {
  const api = new Gitlab(getGitlabOptions(context));
  const projectsInGroup = await api.Groups.projects(owner);
  const project = projectsInGroup.filter((p) => p.name === repo)[0];
  const branches = await api.Branches.all(project && project.id);

  return branches.map((branch) => branch.name);
};

export const checkPermissions = async ({ context, owner, repo }: { context: ContextObject, owner: string, repo: string }) => {
  try {
    const api = new Gitlab(getGitlabOptions(context));
    const currentUser = await api.Users.current();

    if (!currentUser || currentUser.state !== 'active') return null;

    return currentUser.can_create_group && currentUser.can_create_project;
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
  const api = new Gitlab(getGitlabOptions(context));
  const projectsInGroup = await api.Groups.projects(owner);
  const project = projectsInGroup.filter((p) => p.name === repo)[0];

  try {
    const content = await api.RepositoryFiles.showRaw(project && project.id, context.filePath, { ref: context.branch });
    return {
      values: JSON.parse(content),
    };
    // response = await octokit.rest.repos.getContent({
    //   owner,
    //   repo,
    //   path: context.filePath,
    //   ref: context.branch,
    // });

    // const fileContents: Array<{ name: string; data: string }> = [];
    // if (Array.isArray(response.data) && opts.multiFile) {
    //   const folderResponse = await octokit.rest.git.createTree({
    //     owner,
    //     repo,
    //     tree: response.data.map((item) => ({ path: item.path, sha: item.sha, mode: getTreeMode(item.type) })),
    //   });
    //   if (folderResponse.data.tree[0].sha) {
    //     const treeResponse = await octokit.rest.git.getTree({
    //       owner,
    //       repo,
    //       tree_sha: folderResponse.data.tree[0].sha,
    //       recursive: 'true',
    //     });
    //     if (treeResponse.data.tree.length > 0) {
    //       await Promise.all(
    //         treeResponse.data.tree
    //           .filter((i) => i.path?.endsWith('.json'))
    //           .map((treeItem) => {
    //             if (treeItem.path) {
    //               return octokit.rest.repos
    //                 .getContent({
    //                   owner,
    //                   repo,
    //                   path: `${context.filePath}/${treeItem.path}`,
    //                   ref: context.branch,
    //                 })
    //                 .then((res) => {
    //                   if (!Array.isArray(res.data) && 'content' in res.data && treeItem.path) {
    //                     fileContents.push({ name: treeItem.path.replace('.json', ''), data: decodeBase64(res.data.content) });
    //                   }
    //                 });
    //             }
    //             return null;
    //           }),
    //       );
    //     }
    //   }

    //   if (fileContents.length > 0) {
    //     // If we receive multiple files, parse each
    //     // sort by name (as we can't guarantee order)
    //     const allContents = fileContents
    //       .sort((a, b) => a.name.localeCompare(b.name))
    //       .reduce((acc, curr) => {
    //         if (IsJSONString(curr.data)) {
    //           const parsed = JSON.parse(curr.data);

    //           acc[curr.name] = parsed;
    //         }
    //         return acc;
    //       }, {});
    //     return allContents ? { values: allContents } : null;
    //   }
    // } else if ('content' in response.data) {
    //   const data = decodeBase64(response.data.content);
    //   // If content of file is parseable JSON, parse it
    //   if (IsJSONString(data)) {
    //     const parsed = JSON.parse(data);
    //     return {
    //       values: parsed,
    //     };
    //   }
    // }
    // // If not, return null as we can't process that file. We should let the user know, though.
    // return null;
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
  api: Resources.Gitlab,
  context: {
    projectId: number;
    branch: string;
    filePath: string;
    tokenObj: TokenSets;
    commitMessage?: string;
  },
  opts: FeatureFlagOpts,
) => {
  const files = extractFiles(context.filePath, context.tokenObj, opts);

  return Promise.all(
    Object.keys(files).map((path) => api.RepositoryFiles.create(
      context.projectId,
      context.filePath,
      context.branch,
      files[path],
      context.commitMessage || 'Commit from Figma',
    )),
  );
};

export function useGitLab() {
  const tokens = useSelector(tokensSelector);
  const localApiState = useSelector(localApiStateSelector);
  const featureFlags = useSelector(featureFlagsSelector);
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  async function askUserIfPull(): Promise<boolean> {
    const { result } = await confirm({
      text: 'Pull from GitLab?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return result;
  }

  function getTokenObj() {
    const raw = convertTokensToObject(tokens);
    const string = JSON.stringify(raw, null, 2);
    return { raw, string };
  }

  async function writeTokensToGitLab({
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
      const api = new Gitlab(getGitlabOptions(context));
      const projectsInGroup = await api.Groups.projects(owner);
      const project = projectsInGroup.filter((p) => p.name === repo)[0];
      const projectId = project && project.id;
      const branchesInProject = await api.Branches.all(projectId);
      const branches = branchesInProject.map((branch) => branch.name);
      const branch = customBranch || context.branch;

      if (!branches) return null;

      if (branches.includes(branch)) {
        await createOrUpdateFiles(
          api,
          {
            projectId,
            branch,
            filePath: context.filePath,
            tokenObj,
            commitMessage: commitMessage || 'Commit from Figma',
          },
          { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
        );
      } else {
        await api.Branches.create(projectId, branch, branches[0]);
        await createOrUpdateFiles(
          api,
          {
            projectId,
            branch,
            filePath: context.filePath,
            tokenObj,
            commitMessage: commitMessage || 'Commit from Figma',
          },
          { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
        );
      }
      dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenObj, null, 2));
      notifyToUI('Pushed changes to GitLab');
    } catch (e) {
      notifyToUI('Error pushing to GitLab', { error: true });
      console.log('Error pushing to GitLab', e);
    }
    return null;
  }

  async function pushTokensToGitLab(context: ContextObject) {
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
        await writeTokensToGitLab({
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
        console.log('Error pushing to GitLab', e);
      }
    }
    return rawTokenObj;
  }

  async function checkAndSetAccess({ context, owner, repo }: { context: ContextObject; owner: string; repo: string }) {
    const hasWriteAccess = await checkPermissions({ context, owner, repo });
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }

  async function pullTokensFromGitLab(context: ContextObject, receivedFeatureFlags?: FeatureFlags) {
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

  // Function to initially check auth and sync tokens with GitLab
  async function syncTokensWithGitLab(context: ContextObject): Promise<TokenValues | null> {
    try {
      const [owner, repo] = context.id.split('/');

      const hasBranches = await fetchBranches({ context, owner, repo });

      if (!hasBranches) {
        return null;
      }

      const content = await pullTokensFromGitLab(context);

      const { string: tokenObj } = getTokenObj();

      if (content) {
        if (!hasSameContent(content, tokenObj)) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            dispatch.tokenState.setLastSyncedState(JSON.stringify(content.values, null, 2));
            dispatch.tokenState.setTokenData(content);
            notifyToUI('Pulled tokens from GitLab');
            return content;
          }
          return { values: tokenObj };
        }
        return content;
      }
      return await pushTokensToGitLab(context);
    } catch (e) {
      notifyToUI('Error syncing with GitLab, check credentials', { error: true });
      console.log('Error', e);
      return null;
    }
  }

  async function addNewGitLabCredentials(context: ContextObject): Promise<TokenValues | null> {
    let { raw: rawTokenObj } = getTokenObj();

    const data = await syncTokensWithGitLab(context);

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
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
  };
}
