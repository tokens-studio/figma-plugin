import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import { OAuthService } from '@/app/services/OAuthService';
import { TOKENS_STUDIO_APP_URL } from '@/constants/TokensStudio';
import { useAuthStore } from '@/app/store/useAuthStore';
import { notifyToUI } from '@/plugin/notifiers';
import { RestApiError } from '@/utils/tokensStudio/restApi';
import {
  lookupBySanitized,
  sanitizeDisplayName,
  sanitizeTokenSetName,
} from './sanitizeForStudio';

export type ThemePushFailure = {
  themeName: string;
  action: 'create' | 'update';
  reason: string;
  // Set when the theme group, rather than the theme itself, was refused.
  groupName?: string;
};

export type ThemePushResult = { ok: true } | { ok: false; failure: ThemePushFailure };

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
    // Server names are raw; `groupName` is sanitized. Compare sanitized forms so
    // an existing group is matched instead of being re-created.
    const match = groups.find((g: any) => sanitizeDisplayName(String(g.attributes?.name || g.name || '')) === groupName);
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

export function themePushFailureMessage(failure: ThemePushFailure): string {
  if (failure.groupName) return `Couldn't create theme group "${failure.groupName}": ${failure.reason}`;
  return `Couldn't ${failure.action} theme "${failure.themeName}": ${failure.reason}`;
}

/**
 * Report refused theme pushes. Several themes at once — a variables import, say — share one message
 * rather than one toast each, since they usually fail for the same reason.
 */
export function notifyThemePushFailures(failures: ThemePushFailure[]): void {
  if (!failures.length) return;
  if (failures.length === 1) {
    notifyToUI(themePushFailureMessage(failures[0]), { error: true });
    return;
  }
  const reasons = Array.from(new Set(failures.map((failure) => failure.reason)));
  notifyToUI(
    reasons.length === 1
      ? `Couldn't save ${failures.length} themes in Tokens Studio: ${reasons[0]}`
      : `Couldn't save ${failures.length} themes in Tokens Studio. First problem: ${reasons[0]}`,
    { error: true },
  );
}

export async function pushThemeToTokensStudioOAuth(
  payload: any,
  rootState: any,
  dispatch: any,
  // A caller pushing several themes collects the failures and reports them in one message instead.
  { notifyOnFailure = true }: { notifyOnFailure?: boolean } = {},
): Promise<ThemePushResult> {
  if (rootState?.uiState?.api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return { ok: true };

  // Read once from the live store — rootState in effects is the pre-dispatch snapshot and
  // may have stale remote metadata / themes that were just written by the reducer.
  const liveState = store.getState();
  const { metadata } = liveState.tokenState?.remoteData || {};
  const { themeGroupsData, tokenSetsData } = metadata || {};
  const isNewTheme = !payload?.id;

  // Local themes keep their raw Figma names while `payload` carries sanitized ones, so compare
  // sanitized forms — an exact match would fail.
  const findLocalTheme = () => store.getState().tokenState.themes.find(
    (t: any) => sanitizeDisplayName(t.name ?? '') === payload?.name
      && sanitizeDisplayName(t.group ?? '') === (payload?.group || ''),
  );

  // The reducer already added the theme locally. When the API refuses the create, take it back out
  // again so the UI doesn't show a theme that exists nowhere else and vanishes on the next pull.
  const rollbackNewTheme = () => {
    if (!isNewTheme) return;
    const localTheme = findLocalTheme();
    if (!localTheme) return;
    // A new theme in a parent group also adds mirrored themes to extension groups; they go too.
    store.getState().tokenState.themes
      .filter((t: any) => t.$figmaParentThemeId === localTheme.id)
      .forEach((child: any) => dispatch.tokenState.removeTheme(child.id));
    dispatch.tokenState.removeTheme(localTheme.id);
    dispatch.tokenState.updateDocument({ updateRemote: false, shouldUpdateNodes: false });
  };

  const fail = (failure: ThemePushFailure): ThemePushResult => {
    if (notifyOnFailure) notifyThemePushFailures([failure]);
    rollbackNewTheme();
    return { ok: false, failure };
  };

  // `payload.group` is sanitized; themeGroupsData is keyed by the raw server
  // name, so an exact lookup would miss and create a duplicate group.
  let themeGroupId = payload.group
    ? (lookupBySanitized(themeGroupsData, payload.group, sanitizeDisplayName) as any)?.id
    : null;

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
      return fail({
        themeName: payload?.name, action: 'create', groupName: payload.group, reason: failureDetail(error),
      });
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
      return fail({
        themeName: payload?.name,
        action: 'create',
        groupName: payload.group,
        reason: 'the theme group could not be found or created.',
      });
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
    // Set names arrive sanitized; tokenSetsData is keyed by the raw server name.
    const setId = (lookupBySanitized(tokenSetsData, setName, sanitizeTokenSetName) as any)?.id;
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
    return fail({
      themeName: payload?.name,
      action: isNewTheme ? 'create' : 'update',
      reason: failureDetail(error),
    });
  }

  if (isNewTheme && result?.data?.id) {
    // Re-read after the async create — the reducer has run by now and stored the theme with a local
    // hash id. Find it by name + group so we can swap it for the server-assigned id.
    const localTheme = findLocalTheme();
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

  return { ok: true };
}
