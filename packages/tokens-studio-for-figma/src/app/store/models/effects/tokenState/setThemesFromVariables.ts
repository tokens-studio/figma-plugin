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
      // If new tokens are also being imported at the same time, setTokensFromVariables will push
      // themes after token sets are created (so selected_token_sets can include server IDs).
      // Skip here to avoid pushing themes before token set IDs are available.
      const hasNewTokens = (currentState.tokenState.importedTokens?.newTokens || []).some((t) => t.parent != null);
      if (hasNewTokens) return;

      const { importedThemes } = currentState.tokenState;
      // newThemes have locally-generated name-based IDs (e.g. "core-primitives") assigned by
      // pullVariables.ts — not server UUIDs. Strip the id so pushThemeToTokensStudioOAuth
      // picks CREATE_THEME (POST) instead of UPDATE_THEME (PATCH → 404).
      const newThemesToPush = (importedThemes?.newThemes || []).map((t) => ({ ...t, id: undefined }));
      const updatedThemesToPush = importedThemes?.updatedThemes || [];

      // Push sequentially so that a shared theme group is only created once.
      // Concurrent pushes would both see groupId=null and create duplicate groups.
      (async () => {
        for (const theme of [...newThemesToPush, ...updatedThemesToPush]) {
          // eslint-disable-next-line no-await-in-loop
          await pushThemeToTokensStudioOAuth(theme, currentState, dispatch);
        }
      })();
    }
  };
}
