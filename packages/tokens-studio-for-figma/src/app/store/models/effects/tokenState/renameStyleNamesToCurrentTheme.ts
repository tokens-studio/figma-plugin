import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';

export function renameStyleNamesToCurrentTheme(dispatch: RematchDispatch<RootModel>) {
  return (_payload: any, _rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: false,
      shouldUpdateNodes: false,
    });

    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      currentState.tokenState?.themes?.forEach((theme: any) => {
        pushThemeToTokensStudioOAuth(theme, currentState, dispatch);
      });
    }
  };
}
