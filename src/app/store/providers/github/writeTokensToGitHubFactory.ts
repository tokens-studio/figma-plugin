import { Octokit } from '@octokit/rest';
import { ContextObject } from '@/types/api';
import { AnyTokenSet, TokenValues } from '@/types/tokens';
import { fetchBranches } from './fetchBranches';
import { createOrUpdateFiles } from './createOrUpdateFiles';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '@/plugin/notifiers';

type Options = {
  context: ContextObject;
  tokenObj: Record<string, AnyTokenSet>;
  owner: string;
  repo: string;
  commitMessage?: string;
  customBranch?: string;
};

export function writeTokensToGitHubFactory(dispatch: Dispatch, featureFlags?: { gh_mfs_enabled?: boolean }) {
  return async ({
    context,
    tokenObj,
    owner,
    repo,
    commitMessage,
    customBranch,
  }: Options): Promise<TokenValues | null> => {
    try {
      // eslint-disable-next-line
      const OctokitWithPlugin = Octokit.plugin(require('octokit-commit-multiple-files'));
      const octokit = new OctokitWithPlugin({ auth: context.secret, baseUrl: context.baseUrl });

      const branches = await fetchBranches({ context, owner, repo });
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
  };
}
