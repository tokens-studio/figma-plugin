import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';
import { ThemeObjectsList } from '@/types';

export function setThemesFromVariables(dispatch: RematchDispatch<RootModel>) {
  return (_payload: ThemeObjectsList, _rootState: any): void => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    // After the reducer runs, importedThemes will contain new and updated themes.
    // The subsequent setThemes call will merge them into state.themes.
    // We need to push the updated themes to Studio OAuth.
    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      const { importedThemes } = currentState.tokenState;
      const themesToPush = [
        ...(importedThemes?.newThemes || []),
        ...(importedThemes?.updatedThemes || []),
      ];

      themesToPush.forEach((theme) => {
        pushThemeToTokensStudioOAuth(theme, currentState, dispatch);
      });
    }
  };
}
