import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';

export function assignStyleIdsToCurrentTheme(dispatch: RematchDispatch<RootModel>) {
  return (payload: { selectedThemes: string[] }, rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      payload?.selectedThemes?.forEach((themeId) => {
        const theme = rootState.tokenState?.themes?.find((t: any) => t.id === themeId);
        if (theme) {
          pushThemeToTokensStudioOAuth(theme, rootState, dispatch);
        }
      });
    }
  };
}
