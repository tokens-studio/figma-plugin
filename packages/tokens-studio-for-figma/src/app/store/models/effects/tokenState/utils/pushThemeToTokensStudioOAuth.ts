import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import { OAuthService } from '@/app/services/OAuthService';
import { TOKENS_STUDIO_APP_URL } from '@/constants/TokensStudio';
import { useAuthStore } from '@/app/store/useAuthStore';
import { notifyToUI } from '@/plugin/notifiers';
import { RestApiError } from '@/utils/tokensStudio/restApi';

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

/**
 * What to tell the user about a refused write. The API's own wording is the most useful: a plan limit
 * reads "Your plan includes 1 theme group. Upgrade to add more."
 */
function failureDetail(error: unknown): string {
  if (error instanceof RestApiError && error.detail) return error.detail;
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function pushThemeToTokensStudioOAuth(payload: any, rootState: any, dispatch: any) {
  if (rootState?.uiState?.api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH) {
    // Read once from the live store — rootState in effects is the pre-dispatch snapshot and
    // may have stale remote metadata / themes that were just written by the reducer.
    const liveState = store.getState();
    const { metadata } = liveState.tokenState?.remoteData || {};
    const { themeGroupsData, tokenSetsData } = metadata || {};
    const isNewTheme = !payload?.id;

    // The reducer already added the theme locally. When the API refuses the create, take it back out
    // again so the UI doesn't show a theme that exists nowhere else and vanishes on the next pull.
    const rollbackNewTheme = () => {
      if (!isNewTheme) return;
      const localTheme = store.getState().tokenState.themes.find(
        (t: any) => t.name === payload?.name && t.group === (payload?.group || undefined),
      );
      if (!localTheme) return;
      dispatch.tokenState.removeTheme(localTheme.id);
      dispatch.tokenState.updateDocument({ updateRemote: false, shouldUpdateNodes: false });
    };

    let themeGroupId = payload.group ? themeGroupsData?.[payload.group]?.id : null;

    if (payload.group && !themeGroupId) {
      let createResult: any;
      try {
        // Try to create the theme group
        createResult = await pushToTokensStudioOAuth({
          context: rootState.uiState.api,
          action: 'CREATE_THEME_GROUP',
          data: { name: payload.group },
          rethrowErrors: true,
        });
      } catch (error) {
        notifyToUI(`Couldn't create theme group "${payload.group}": ${failureDetail(error)}`, { error: true });
        rollbackNewTheme();
        return;
      }

      if (createResult?.data?.id) {
        themeGroupId = createResult.data.id;
      } else {
        // Creation returned null (the group already exists).
        // Fetch from the server to get the existing group's ID.
        const { id: projectId, changeSetId } = rootState.uiState.api;
        themeGroupId = await fetchThemeGroupId(projectId, payload.group, changeSetId);
      }

      if (!themeGroupId) {
        // Without the group's id the theme would be pushed ungrouped, which the API refuses anyway.
        notifyToUI(`Couldn't find or create theme group "${payload.group}" in Tokens Studio.`, { error: true });
        rollbackNewTheme();
        return;
      }

      // Update the remote metadata so subsequent calls in this session don't re-create
      dispatch.tokenState.setRemoteMetadata({
        ...metadata,
        themeGroupsData: {
          ...themeGroupsData,
          [payload.group]: { id: themeGroupId },
        },
      });
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

    let result: any;
    try {
      result = await pushToTokensStudioOAuth({
        context: rootState.uiState.api,
        action: isNewTheme ? 'CREATE_THEME' : 'UPDATE_THEME',
        data: isNewTheme ? themeData : { ...themeData, id: payload.id },
        rethrowErrors: true,
      });
    } catch (error) {
      // An edit that failed keeps the local change; only a create is undone, since the theme it added
      // never reached Tokens Studio.
      notifyToUI(
        `Couldn't ${isNewTheme ? 'create' : 'update'} theme "${payload?.name}": ${failureDetail(error)}`,
        { error: true },
      );
      rollbackNewTheme();
      return;
    }

    if (isNewTheme && result?.data?.id) {
      // Re-read after the async create — the reducer has run by now and stored the theme with a local hash id.
      // Find it by name + group so we can swap it for the server-assigned id.
      const localTheme = store.getState().tokenState.themes.find(
        (t: any) => t.name === payload.name && t.group === (payload.group || undefined),
      );
      if (localTheme) {
        dispatch.tokenState.updateTheme({
          oldId: localTheme.id,
          theme: {
            ...localTheme,
            id: result.data.id,
          },
        });
      }
    }
  }
}
