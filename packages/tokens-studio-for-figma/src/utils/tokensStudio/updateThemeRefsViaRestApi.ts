import { RematchRootState } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { ThemeObjectsList } from '@/types';
import { useAuthStore } from '@/app/store/useAuthStore';
import { OAuthService } from '@/app/services/OAuthService';
import { TOKENS_STUDIO_APP_URL } from '@/constants/TokensStudio';
import { resolveChangeSetId } from './fetchBranchesListRest';
import { patchThemeGroupVariableRefs, patchThemeOptionStyleRefs } from './pushThemeRefsRest';

interface UpdateThemeRefsPayload {
  prevState: RematchRootState<RootModel, Record<string, never>>;
  rootState: RematchRootState<RootModel, Record<string, never>>;
}

/**
 * Diffs prev vs next themes and PATCHes changed refs to Studio-on-Rails.
 * Only called for ref-mutation actions on the OAuth provider path.
 */
export async function updateThemeRefsViaRestApi({
  prevState,
  rootState,
}: UpdateThemeRefsPayload): Promise<void> {
  const { oauthTokens } = useAuthStore.getState();
  if (!oauthTokens?.accessToken) return;

  const context = rootState.uiState.api;
  if (!context || !('id' in context)) return;

  const projectId = (context as any).id;
  const branchName = (context as any).branch || 'main';

  const apiBaseUrl = OAuthService.getApiBaseUrl(TOKENS_STUDIO_APP_URL);

  const changeSetId = await resolveChangeSetId(
    oauthTokens.accessToken,
    apiBaseUrl,
    projectId,
    branchName,
  );
  if (!changeSetId) {
    console.error('[updateThemeRefsViaRestApi] Could not resolve change_set_id, aborting write');
    return;
  }

  const prevThemes: ThemeObjectsList = prevState.tokenState.themes;
  const nextThemes: ThemeObjectsList = rootState.tokenState.themes;

  // Track which groups have already been patched (variable refs are group-level)
  const patchedGroups = new Set<string>();

  for (const nextTheme of nextThemes) {
    const prevTheme = prevThemes.find((t) => t.id === nextTheme.id);
    if (!prevTheme) continue;

    const themeGroupId = nextTheme.$themeGroupId;
    const themeOptionId = nextTheme.$themeOptionId;

    // Variable refs — group-level, only PATCH once per group
    if (themeGroupId && !patchedGroups.has(themeGroupId)) {
      const prevVarRefs = prevTheme.$figmaVariableReferences;
      const nextVarRefs = nextTheme.$figmaVariableReferences;

      if (!shallowEqual(prevVarRefs, nextVarRefs)) {
        patchedGroups.add(themeGroupId);
        try {
          await patchThemeGroupVariableRefs(
            oauthTokens.accessToken,
            apiBaseUrl,
            projectId,
            changeSetId,
            themeGroupId,
            nextVarRefs ?? {},
          );
        } catch (err) {
          console.error('[updateThemeRefsViaRestApi] Failed to patch variable refs:', err);
        }
      }
    }

    // Style refs — option-level
    if (themeOptionId) {
      const prevStyleRefs = prevTheme.$figmaStyleReferences;
      const nextStyleRefs = nextTheme.$figmaStyleReferences;

      if (!shallowEqual(prevStyleRefs, nextStyleRefs)) {
        try {
          await patchThemeOptionStyleRefs(
            oauthTokens.accessToken,
            apiBaseUrl,
            projectId,
            changeSetId,
            themeOptionId,
            nextStyleRefs ?? {},
          );
        } catch (err) {
          console.error('[updateThemeRefsViaRestApi] Failed to patch style refs:', err);
        }
      }
    }
  }
}

function shallowEqual(
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
}
