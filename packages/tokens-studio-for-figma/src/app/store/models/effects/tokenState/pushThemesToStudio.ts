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

    if (store.getState()?.uiState?.api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return;

    const failures: ThemePushFailure[] = [];
    for (const themeId of Array.from(new Set(themeIds))) {
      // Read per theme: state can change while an earlier push waits, and a stale copy would overwrite a newer save.
      const currentState = store.getState();
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
