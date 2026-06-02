import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import { OAuthService } from '@/app/services/OAuthService';
import { TOKENS_STUDIO_APP_URL } from '@/constants/TokensStudio';
import { useAuthStore } from '@/app/store/useAuthStore';

/**
 * Fetch existing theme groups from the REST API to resolve group name → ID.
 */
async function fetchThemeGroupId(projectId: string, groupName: string, changeSetId?: string): Promise<string | null> {
  const { oauthTokens } = useAuthStore.getState();
  if (!oauthTokens?.accessToken) return null;

  const studioUrl = TOKENS_STUDIO_APP_URL;
  const apiBaseUrl = OAuthService.getApiBaseUrl(studioUrl);
  const csQuery = changeSetId ? `?change_set_id=${encodeURIComponent(changeSetId)}` : '';
  const url = `${apiBaseUrl}/api/v1/projects/${projectId}/theme_groups${csQuery}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${oauthTokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const groups = json.data || [];
    const match = groups.find((g: any) => (g.attributes?.name || g.name) === groupName);
    return match?.id || null;
  } catch {
    return null;
  }
}

export async function pushThemeToTokensStudioOAuth(payload: any, rootState: any, dispatch: any) {
  if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
    // Always read the freshest metadata from the live store to avoid stale cache
    const freshState = store.getState();
    const { metadata } = freshState.tokenState?.remoteData || {};
    const { themeGroupsData, tokenSetsData } = metadata || {};

    let themeGroupId = payload.group ? themeGroupsData?.[payload.group]?.id : null;

    if (payload.group && !themeGroupId) {
      // Try to create the theme group
      const createResult = await pushToTokensStudioOAuth({
        context: rootState.uiState.api,
        action: 'CREATE_THEME_GROUP',
        data: { name: payload.group },
      });

      if (createResult?.data?.id) {
        themeGroupId = createResult.data.id;
      } else {
        // Creation returned null (likely 422 — group already exists).
        // Fetch from the server to get the existing group's ID.
        const { id: projectId, changeSetId } = rootState.uiState.api;
        themeGroupId = await fetchThemeGroupId(projectId, payload.group, changeSetId);
      }

      // Update the remote metadata so subsequent calls in this session don't re-create
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

    // Map set names to IDs. If no metadata mapping is available, send the name directly —
    // the Rails API accepts both UUIDs and names in selected_token_sets.
    const selectedTokenSets: Record<string, string> = {};
    Object.entries(payload?.selectedTokenSets || {}).forEach(([setName, status]) => {
      const setId = (tokenSetsData?.[setName] as any)?.id;
      selectedTokenSets[setId || setName] = (status as string).toLowerCase();
    });

    const themeData = {
      name: payload?.name,
      theme_group_id: themeGroupId,
      selected_token_sets: selectedTokenSets,
      figma_style_references: payload?.$figmaStyleReferences && !Array.isArray(payload.$figmaStyleReferences)
        ? payload.$figmaStyleReferences
        : {},
      figma_variable_references: payload?.$figmaVariableReferences && !Array.isArray(payload.$figmaVariableReferences)
        ? payload.$figmaVariableReferences
        : {},
      figma_collection_id: payload?.$figmaCollectionId || null,
      figma_mode_id: payload?.$figmaModeId || null,
    };

    const result = await pushToTokensStudioOAuth({
      context: rootState.uiState.api,
      action: payload?.id ? 'UPDATE_THEME' : 'CREATE_THEME',
      data: payload?.id ? { ...themeData, id: payload.id } : themeData,
    });

    if (!payload?.id && result?.data?.id) {
      // Update local theme ID if it was a create operation
      dispatch.tokenState.updateTheme({
        oldId: payload?.id || result.data.id, // Fallback if no local ID
        theme: {
          ...payload,
          id: result.data.id,
        },
      });
    }
  }
}
