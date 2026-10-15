import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';

export function restoreVariableReferencesToThemes(dispatch: RematchDispatch<RootModel>) {
  return (payload: Record<string, unknown>, _rootState: any): void => {
    // One document update for all affected themes
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      currentState.tokenState?.themes
        ?.filter((theme: any) => theme.id in payload)
        .forEach((theme: any) => pushThemeToTokensStudioOAuth(theme, currentState, dispatch));
    }
  };
}
