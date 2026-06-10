import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';

export function removeStyleNamesFromThemes(dispatch: RematchDispatch<RootModel>) {
  return (payload: string, rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: false,
      shouldUpdateNodes: false,
    });

    if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      const currentState = store.getState();
      // The reducer removed the style name from all themes — push every theme that had it
      currentState.tokenState?.themes?.forEach((theme: any) => {
        pushThemeToTokensStudioOAuth(theme, currentState, dispatch);
      });
    }
  };
}
