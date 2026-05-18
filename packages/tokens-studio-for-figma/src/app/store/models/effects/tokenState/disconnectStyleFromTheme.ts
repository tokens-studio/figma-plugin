import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';

export function disconnectStyleFromTheme(dispatch: RematchDispatch<RootModel>) {
  return (payload: { id: string; key: string | string[] }, _rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      const theme = currentState.tokenState?.themes?.find((t: any) => t.id === payload.id);
      if (theme) {
        pushThemeToTokensStudioOAuth(theme, currentState, dispatch);
      }
    }
  };
}
