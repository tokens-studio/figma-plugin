import { useDispatch, useSelector } from 'react-redux';
import { Resources } from '@gitbeaker/core';
import { Gitlab } from '@gitbeaker/browser';
import { Dispatch } from '@/app/store';
import { MessageToPluginTypes } from '@/types/messages';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import IsJSONString from '@/utils/isJSONString';
import { ContextObject } from '@/types/api';
import { notifyToUI, postToFigma } from '../../../plugin/notifiers';
import { FeatureFlags } from '@/utils/featureFlags';
import { AnyTokenSet, TokenValues } from '@/types/tokens';
import { featureFlagsSelector, localApiStateSelector, tokensSelector } from '@/selectors';

type TokenSets = {
  [key: string]: AnyTokenSet;
};

/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getCreatePullRequestUrl(id: string, branchName: string) {
  return `https://gitlab.com/${id}/compare/${branchName}?expand=1`;
}

const getGitlabOptions = (context: ContextObject) => {
  const { secret, baseUrl } = context;

  if (baseUrl && baseUrl.length > 0) {
    return { token: secret, host: baseUrl };
  }
  return { token: secret };
};

const hasSameContent = (content: TokenValues, storedContent: string) => {
  const stringifiedContent = JSON.stringify(content.values, null, 2);
  return stringifiedContent === storedContent;
};

const createBranch = async ({
  api, projectId, branch, from,
} : { api: Resources.Gitlab, projectId: number, branch: string, from: string }) => api.Branches.create(projectId, branch, from);

const getProjectId = async ({ api, owner, repo } : { api: Resources.Gitlab, owner: string, repo: string }) => {
  const projectsInGroup = await api.Groups.projects(owner);
  const project = projectsInGroup.filter((p) => p.name === repo)[0];

  return project && project.id;
};

const getGroupProjectId = async ({ api, owner, repo } : { api: Resources.Gitlab, owner: string, repo: string }) => {
  const projectsInGroup = await api.Groups.projects(owner);
  const project = projectsInGroup.filter((p) => p.name === repo)[0];

  return { projectId: project && project.id, groupId: project && project.namespace.id };
};

const readFileContent = async ({
  api, projectId, filePath, branch,
} : { api: Resources.Gitlab, projectId: number, filePath: string, branch: string }) => api.RepositoryFiles.showRaw(projectId, filePath, { ref: branch });

const checkTreeInPath = async ({ api, projectId, filePath } : { api: Resources.Gitlab, projectId: number, filePath: string }) => api.Repositories.tree(projectId, { path: filePath });

const getBranches = async ({ api, projectId } : { api: Resources.Gitlab, projectId: number }) => {
  const branches = await api.Branches.all(projectId);
  return branches.map((branch) => branch.name);
};

export const fetchBranches = async ({ context, owner, repo }: { context: ContextObject, owner: string, repo: string }) => {
  const api = new Gitlab(getGitlabOptions(context));
  const projectId = await getProjectId({ api, owner, repo });
  const branches = await getBranches({ api, projectId });

  return branches;
};

export const checkPermissions = async ({ api, groupId, projectId }: { api: Resources.Gitlab, groupId: number, projectId: number }) => {
  try {
    const currentUser = await api.Users.current();

    if (!currentUser || currentUser.state !== 'active') return null;

    const groupPermission = await api.GroupMembers.show(groupId, currentUser.id);
    if (groupPermission.access_level) {
      return groupPermission;
    }

    const projectPermission = await api.ProjectMembers.show(projectId, currentUser.id);
    return projectPermission;
  } catch (e) {
    console.log(e);

    return null;
  }
};

export const readContents = async ({
  context, owner, repo, opts,
}: { context: ContextObject, owner: string, repo: string, opts: FeatureFlagOpts }) => {
  const api = new Gitlab(getGitlabOptions(context));
  const projectId = await getProjectId({ api, owner, repo });

  try {
    const { filePath, branch } = context;
    const trees = await checkTreeInPath({ api, projectId, filePath });
    const fileContents: Array<{ name: string; data: string }> = [];
    if (trees.length > 0 && opts.multiFile) {
      await Promise.all(
        trees
          .filter((tree) => tree.name?.endsWith('.json'))
          .map((tree) => {
            if (tree.name) {
              return readFileContent({
                api,
                projectId,
                filePath: tree.path,
                branch,
              })
                .then((res) => {
                  fileContents.push({
                    name: tree.name?.replace('.json', ''),
                    data: res,
                  });
                });
            }
            return null;
          }),
      );
      if (fileContents.length > 0) {
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
    } else {
      const content = await readFileContent({
        api, projectId, filePath, branch,
      });
      if (IsJSONString(content)) {
        return {
          values: JSON.parse(content),
        };
      }
    }

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

enum GitLabAccessLevel {
  NoAccess = 0,
  MinimalAccess = 5,
  Guest = 10,
  Reporter = 20,
  Developer = 30,
  Maintainer = 40,
  Owner = 50,
}

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

const createFiles = (
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
      path,
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
      const projectId = await getProjectId({ api, owner, repo });
      const branches = await getBranches({ api, projectId });
      const branch = customBranch || context.branch;

      if (!branches) return null;

      if (branches.includes(branch)) {
        await createFiles(
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
        await createBranch({
          api, projectId, branch, from: branches[0],
        });
        await createFiles(
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
    const api = new Gitlab(getGitlabOptions(context));
    const { projectId, groupId } = await getGroupProjectId({ api, owner, repo });
    const permission = await checkPermissions({ api, groupId, projectId });

    dispatch.tokenState.setEditProhibited(!(permission?.access_level > GitLabAccessLevel.Developer));
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
