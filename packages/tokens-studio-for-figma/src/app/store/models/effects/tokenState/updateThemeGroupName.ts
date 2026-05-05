import type { RematchDispatch } from '@rematch/core';
import omit from 'just-omit';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../providers/tokens-studio/tokensStudioOAuth';

export function updateThemeGroupName(dispatch: RematchDispatch<RootModel>) {
  return async (oldGroupName: string, newGroupName: string, rootState: any): Promise<void> => {
    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      const { metadata } = rootState.tokenState.remoteData;
      const { themeGroupsData } = metadata || {};
      const groupId = themeGroupsData?.[oldGroupName]?.id;

      if (groupId) {
        await pushToTokensStudioOAuth({
          context: rootState.uiState.api,
          action: 'UPDATE_THEME_GROUP',
          data: { id: groupId, name: newGroupName },
        });

        // Update metadata
        dispatch.tokenState.setRemoteMetadata({
          ...metadata,
          themeGroupsData: {
            ...omit(themeGroupsData, oldGroupName),
            [newGroupName]: { id: groupId },
          },
        });
      }
    }
  };
}
