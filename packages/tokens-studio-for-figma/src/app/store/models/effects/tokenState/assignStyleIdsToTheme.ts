import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';

export function assignStyleIdsToTheme(dispatch: RematchDispatch<RootModel>) {
  return (payload: { id: string; styleIds: Record<string, string> }, rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      const theme = rootState.tokenState?.themes?.find((t: any) => t.id === payload?.id);
      if (theme) {
        pushThemeToTokensStudioOAuth(theme, rootState, dispatch);
      }
    }
  };
}
