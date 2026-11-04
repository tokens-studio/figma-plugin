import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth, type ThemePushFailure } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';

/**
 * Push the given themes to Tokens Studio once each, one at a time. Writes to a branch queue behind each
 * other on the server, so sending them together only makes each one slower.
 */
export function pushThemesToStudio(dispatch: RematchDispatch<RootModel>) {
  return async (themeIds: string[]): Promise<void> => {
    if (!themeIds?.length) return;

    const startApi: any = store.getState()?.uiState?.api;
    if (startApi?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return;

    const failures: ThemePushFailure[] = [];
    for (const themeId of Array.from(new Set(themeIds))) {
      // Read per theme: state can change while an earlier push waits, and a stale copy would overwrite a newer save.
      const currentState = store.getState();
      const currentApi: any = currentState.uiState?.api;
      // A branch switch sets the new change set before the pull replaces the themes, so stop: the next theme could
      // be the old branch's copy, and branches share theme ids.
      if (currentApi?.id !== startApi.id || currentApi?.changeSetId !== startApi.changeSetId) break;

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
