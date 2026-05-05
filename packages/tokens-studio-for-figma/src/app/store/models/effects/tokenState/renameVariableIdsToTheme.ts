import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';

export function renameVariableIdsToTheme(dispatch: RematchDispatch<RootModel>) {
  return (payload: any, rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      rootState.tokenState?.themes?.forEach((theme: any) => {
        pushThemeToTokensStudioOAuth(theme, rootState, dispatch);
      });
    }
  };
}
