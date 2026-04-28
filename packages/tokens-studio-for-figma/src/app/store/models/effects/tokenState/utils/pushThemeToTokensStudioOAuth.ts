import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../../providers/tokens-studio/tokensStudioOAuth';

export async function pushThemeToTokensStudioOAuth(payload: any, rootState: any, dispatch: any) {
  if (rootState.uiState.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
    const { metadata } = rootState.tokenState.remoteData;
    const { themeGroupsData, tokenSetsData } = metadata || {};

    let themeGroupId = payload.group ? themeGroupsData?.[payload.group]?.id : null;

    if (payload.group && !themeGroupId) {
      // Create new theme group
      const result = await pushToTokensStudioOAuth({
        context: rootState.uiState.api,
        action: 'CREATE_THEME_GROUP',
        data: { name: payload.group },
      });
      themeGroupId = result?.data?.id;
      // Update the remote metadata to include the new group ID
      if (themeGroupId) {
        dispatch.tokenState.setRemoteMetadata({
          ...metadata,
          themeGroupsData: {
            ...themeGroupsData,
            [payload.group]: { id: themeGroupId },
          },
        });
      }
    }

    const selectedTokenSets: Record<string, string> = {};
    Object.entries(payload.selectedTokenSets).forEach(([setName, status]) => {
      const setId = tokenSetsData?.[setName]?.id;
      if (setId) {
        selectedTokenSets[setId] = (status as string).toLowerCase();
      }
    });

    const themeData = {
      name: payload.name,
      theme_group_id: themeGroupId,
      selected_token_sets: selectedTokenSets,
      figma_style_references: payload.$figmaStyleReferences,
      figma_variable_references: payload.$figmaVariableReferences,
      figma_collection_id: payload.$figmaCollectionId,
      figma_mode_id: payload.$figmaModeId,
    };

    const result = await pushToTokensStudioOAuth({
      context: rootState.uiState.api,
      action: payload.id ? 'UPDATE_THEME' : 'CREATE_THEME',
      data: payload.id ? { ...themeData, id: payload.id } : themeData,
    });

    if (!payload.id && result?.data?.id) {
      // Update local theme ID if it was a create operation
      dispatch.tokenState.updateTheme({
        oldId: payload.id || result.data.id, // Fallback if no local ID
        theme: {
          ...payload,
          id: result.data.id,
        },
      });
    }
  }
}
