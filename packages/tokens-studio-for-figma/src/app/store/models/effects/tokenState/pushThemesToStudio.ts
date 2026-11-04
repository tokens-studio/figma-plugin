import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth, type ThemePushFailure } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';
import { notifyToUI } from '@/plugin/notifiers';

const movedFrom = (start?: string | null, current?: string | null) => !!start && !!current && start !== current;

/**
 * A push resolves a missing change set for the branch in the credentials, so an id that appears or disappears is
 * not a switch. A switch pulls first, which moves the resolver context and the themes, and only then updates the
 * credentials.
 */
function branchChanged(start: any, current: any): boolean {
  const startApi = start.uiState?.api;
  const currentApi = current.uiState?.api;
  return currentApi?.id !== startApi?.id
    || currentApi?.branch !== startApi?.branch
    || movedFrom(startApi?.changeSetId, currentApi?.changeSetId)
    || movedFrom(start.tokenState?.serverResolverContext?.changeSetId, current.tokenState?.serverResolverContext?.changeSetId);
}

/**
 * Push the given themes to Tokens Studio once each, one at a time. Writes to a branch queue behind each
 * other on the server, so sending them together only makes each one slower.
 */
export function pushThemesToStudio(dispatch: RematchDispatch<RootModel>) {
  return async (themeIds: string[]): Promise<void> => {
    if (!themeIds?.length) return;

    const startState = store.getState();
    if (startState?.uiState?.api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return;

    const failures: ThemePushFailure[] = [];
    const uniqueThemeIds = Array.from(new Set(themeIds));
    for (const [index, themeId] of uniqueThemeIds.entries()) {
      // Read per theme: state can change while an earlier push waits, and a stale copy would overwrite a newer save.
      const currentState = store.getState();
      // Branches share theme ids, so a theme read during a switch could reach the wrong branch.
      if (branchChanged(startState, currentState)) {
        const unsent = uniqueThemeIds.length - index;
        notifyToUI(`The branch changed, so ${unsent} ${unsent === 1 ? 'theme was' : 'themes were'} not saved in Tokens Studio. Export styles again to save them.`, { error: true });
        break;
      }

      const theme = currentState.tokenState?.themes?.find((t: any) => t.id === themeId);
      if (theme) {
        // eslint-disable-next-line no-await-in-loop
        const result = await pushThemeToTokensStudioOAuth(theme, currentState, dispatch, { notifyOnFailure: false });
        if (!result.ok) failures.push(result.failure);
      }
    }
    notifyThemePushFailures(failures);
  };
}
