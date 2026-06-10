import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';

export function deleteTheme(dispatch: RematchDispatch<RootModel>) {
  return async (themeId: string, _rootState: any): Promise<void> => {
    dispatch.tokenState.removeTheme(themeId);

    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      await pushToTokensStudioOAuth({
        context: currentState.uiState.api,
        action: 'DELETE_THEME',
        data: { id: themeId },
      });
    }
  };
}
