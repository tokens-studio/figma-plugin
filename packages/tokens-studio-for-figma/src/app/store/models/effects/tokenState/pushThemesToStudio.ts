import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth, type ThemePushFailure } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';

const movedFrom = (start?: string | null, current?: string | null) => !!start && start !== current;

/**
 * A push resolves a change set that is missing after a reload, so a missing id that gets a value is not a switch.
 * A switch pulls first, which moves the resolver context and the themes, and only then updates the credentials.
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
    for (const themeId of Array.from(new Set(themeIds))) {
      // Read per theme: state can change while an earlier push waits, and a stale copy would overwrite a newer save.
      const currentState = store.getState();
      // Branches share theme ids, so a theme read during a switch could reach the wrong branch.
      if (branchChanged(startState, currentState)) break;

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
