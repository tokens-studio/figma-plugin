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
  resolveSanitizedKey,
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
    const match = groups.find((g: any) => sanitizeDisplayName(String(g.attributes?.name || g.name || '')) === sanitizeDisplayName(groupName));
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
  // Callers pass raw names (the theme form) or sanitized ones (variables imports); compare sanitized forms.
  const themeName = sanitizeDisplayName(payload?.name ?? '');
  const groupName = sanitizeDisplayName(payload?.group ?? '');
  // Themes that came from Tokens Studio. A rollback must never take one of these out.
  const remoteThemeIds = new Set<string>((liveState.tokenState?.remoteData?.themes || []).map((t: any) => t.id));

  // The theme this push created locally. The reducer appends new themes, so take the last match, and skip any
  // theme Tokens Studio already has: a same-named theme earlier in the list is someone else's, not this one.
  const findLocalTheme = () => [...store.getState().tokenState.themes].reverse().find(
    (t: any) => !remoteThemeIds.has(t.id)
      && sanitizeDisplayName(t.name ?? '') === themeName
      && sanitizeDisplayName(t.group ?? '') === groupName,
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

  // Tokens Studio keeps every theme in a group and refuses one without; say so instead of sending it.
  if (isNewTheme && !groupName) {
    return fail({
      themeName: payload?.name,
      action: 'create',
      reason: 'themes synced with Tokens Studio need a group.',
    });
  }

  // themeGroupsData is keyed by the raw server name, so an exact lookup would miss and create a duplicate group.
  let themeGroupId = groupName
    ? (lookupBySanitized(themeGroupsData, groupName, sanitizeDisplayName) as any)?.id
    : null;
  // Set when this push created the group, so a refused theme doesn't leave it behind empty.
  let createdGroupId: string | null = null;

  if (groupName && !themeGroupId) {
    const { id: projectId, changeSetId } = rootState.uiState.api;
    let createResult: any;
    let createError: unknown = null;
    try {
      createResult = await pushToTokensStudioOAuth({
        context: rootState.uiState.api,
        action: 'CREATE_THEME_GROUP',
        data: { name: groupName },
        rethrowErrors: true,
      });
    } catch (error) {
      createError = error;
    }

    if (createResult?.data?.id) {
      themeGroupId = createResult.data.id;
      createdGroupId = themeGroupId;
    } else {
      // The group may already exist: Studio reports a plan's group limit or a name it would no longer accept
      // before it checks for a name clash, so look the group up before treating the refusal as final.
      themeGroupId = await fetchThemeGroupId(projectId, groupName, changeSetId);
    }

    if (!themeGroupId) {
      return fail({
        themeName: payload?.name,
        action: 'create',
        groupName,
        reason: createError ? failureDetail(createError) : 'the theme group could not be found or created.',
      });
    }

    // Update the remote metadata so subsequent calls in this session don't re-create
    dispatch.tokenState.setRemoteMetadata({
      ...metadata,
      themeGroupsData: {
        ...themeGroupsData,
        [groupName]: { id: themeGroupId },
      },
    });
  }

  // Creating a theme option takes token set names (Studio maps them to ids); updating one takes ids.
  const selectedTokenSets: Record<string, string> = {};
  Object.entries(payload?.selectedTokenSets || {}).forEach(([setName, status]) => {
    // tokenSetsData is keyed by the raw server name.
    const sanitizedSetName = sanitizeTokenSetName(setName);
    const key = isNewTheme
      ? resolveSanitizedKey(tokenSetsData, sanitizedSetName, sanitizeTokenSetName) || sanitizedSetName
      : (lookupBySanitized(tokenSetsData, sanitizedSetName, sanitizeTokenSetName) as any)?.id || setName;
    selectedTokenSets[key] = (status as string).toLowerCase();
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
    if (createdGroupId) {
      // The group was made for this theme only; don't leave it empty, where it still counts toward a plan's limit.
      await pushToTokensStudioOAuth({
        context: rootState.uiState.api,
        action: 'DELETE_THEME_GROUP_IF_EMPTY',
        data: { id: createdGroupId },
      });
      const { metadata: currentMetadata } = store.getState().tokenState.remoteData || {};
      const remainingGroups = { ...(currentMetadata?.themeGroupsData || {}) };
      delete remainingGroups[resolveSanitizedKey(remainingGroups, groupName, sanitizeDisplayName) ?? groupName];
      dispatch.tokenState.setRemoteMetadata({ ...currentMetadata, themeGroupsData: remainingGroups });
    }
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
    // hash id. Find it so we can swap it for the server-assigned id.
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
