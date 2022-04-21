import { notifyToUI } from '@/plugin/notifiers';
import { hasSameContent } from './hasSameContent';
import { readContents } from './readContents';
import type { ApiDataType, ContextObject } from '@/types/api';
import type { AnyTokenSet } from '@/types/tokens';
import { Dispatch } from '@/app/store';
import { UseDialogResult } from '@/app/hooks/usePushDialog';
import { writeTokensToGitHubFactory } from './writeTokensToGitHubFactory';
import { ThemeObjectsList } from '@/types';

type TokenObject = {
  raw: Record<string, AnyTokenSet>;
  string: string;
};

export function pushTokensToGithubFactory(
  dispatch: Dispatch,
  pushDialog: UseDialogResult['pushDialog'],
  writeTokensToGitHub: ReturnType<typeof writeTokensToGitHubFactory>,
  localApiState: ApiDataType,
  { raw: rawTokenObj, string: tokenObj }: TokenObject,
  themes: ThemeObjectsList,
  featureFlags?: { gh_mfs_enabled?: boolean; } | null,
) {
  return async (context: ContextObject) => {
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
  };
}
