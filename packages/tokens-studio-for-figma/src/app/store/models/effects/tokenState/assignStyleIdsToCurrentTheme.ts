import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';

export function assignStyleIdsToCurrentTheme(dispatch: RematchDispatch<RootModel>) {
  return (payload: { selectedThemes: string[] }, rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      const currentState = store.getState();
      payload?.selectedThemes?.forEach((themeId) => {
        const theme = currentState.tokenState?.themes?.find((t: any) => t.id === themeId);
        if (theme) {
          pushThemeToTokensStudioOAuth(theme, currentState, dispatch);
        }
      });
    }
  };
}
