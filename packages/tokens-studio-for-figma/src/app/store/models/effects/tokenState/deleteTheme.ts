import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { store } from '@/app/store';
import { pushToTokensStudioOAuth } from '../../../providers/tokens-studio/tokensStudioOAuth';
import { lookupBySanitized, resolveSanitizedKey, sanitizeDisplayName } from './utils/sanitizeForStudio';

export function deleteTheme(dispatch: RematchDispatch<RootModel>) {
  return async (themeId: string, rootState: any): Promise<void> => {
    const deletedTheme = rootState?.tokenState?.themes?.find((theme: any) => theme.id === themeId);

    dispatch.tokenState.removeTheme(themeId);

    dispatch.tokenState.updateDocument({
      updateRemote: true,
      shouldUpdateNodes: false,
    });

    if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
      const result = await pushToTokensStudioOAuth({
        context: rootState.uiState.api,
        action: 'DELETE_THEME',
        data: { id: themeId },
      });

      // Deleting a group's last theme leaves the group behind in Tokens Studio, where it is invisible here but
      // still counts toward a plan's group limit. Remove it too.
      const groupName = sanitizeDisplayName(deletedTheme?.group ?? '');
      if (!result || !groupName) return;
      const groupIsEmpty = !store.getState().tokenState.themes
        .some((theme) => sanitizeDisplayName(theme.group ?? '') === groupName);
      const { metadata } = store.getState().tokenState.remoteData || {};
      const groupId = (lookupBySanitized(metadata?.themeGroupsData, groupName, sanitizeDisplayName) as any)?.id;
      if (!groupIsEmpty || !groupId) return;

      await pushToTokensStudioOAuth({
        context: rootState.uiState.api,
        action: 'DELETE_THEME_GROUP_IF_EMPTY',
        data: { id: groupId },
      });
      const remainingGroups = { ...(metadata?.themeGroupsData || {}) };
      delete remainingGroups[resolveSanitizedKey(remainingGroups, groupName, sanitizeDisplayName) ?? groupName];
      dispatch.tokenState.setRemoteMetadata({ ...metadata, themeGroupsData: remainingGroups });
    }
  };
}
