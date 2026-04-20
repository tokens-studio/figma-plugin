import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  activeThemeSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { Dispatch, RootState } from '@/app/store';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { fetchServerResolvedTokens } from '@/utils/tokensStudio/fetchServerResolvedTokens';

const SERVER_RESOLVE_DEBOUNCE_MS = 150;

/**
 * Mounts once at the app root (inside TokensContext.Provider).
 * Whenever activeTheme, tokens, or usedTokenSet change and the project is
 * connected via Tokens Studio OAuth, this hook debounces a call to the
 * Studio gRPC-backed REST endpoint and stores the result in Redux as
 * `tokenState.serverResolvedTokens`.
 *
 * On any failure it silently does nothing — callers fall back to the local
 * TokenResolver automatically.
 */
export function useServerTokenResolver() {
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const serverResolverContext = useSelector(
    (state: RootState) => state.tokenState.serverResolverContext,
  );
  const storageProvider = useSelector(
    (state: RootState) => state.uiState.storageType?.provider,
  );
  const usedTokenSet = useSelector(usedTokenSetSelector);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Build theme_selections in the format the server expects:
   *   { [themeGroupName]: themeOptionName }
   *
   * Plugin stores activeTheme as { [themeGroupId]: themeOptionId }.
   * We resolve the names by looking them up in the full themes list.
   */
  const buildThemeSelections = useCallback((): Record<string, string> => {
    const selections: Record<string, string> = {};
    Object.entries(activeTheme).forEach(([groupId, optionId]) => {
      const matchingTheme = themes.find(
        (t) => t.id === optionId,
      );
      if (matchingTheme) {
        // Use group name as key, option name as value
        selections[matchingTheme.group || groupId] = matchingTheme.name;
      }
    });
    return selections;
  }, [activeTheme, themes]);

  useEffect(() => {
    // Only run for Tokens Studio OAuth projects that have a valid context
    if (
      storageProvider !== StorageProviderType.TOKENS_STUDIO_OAUTH
      || !serverResolverContext
    ) {
      return undefined;
    }

    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      const { oauthTokens } = useAuthStore.getState();
      if (!oauthTokens?.accessToken) return;

      const themeSelections = buildThemeSelections();
      const activeSets = Object.entries(usedTokenSet)
        .filter(([, status]) => status === 'enabled')
        .map(([name]) => name);

      console.log('[ServerResolver] Fetching resolved tokens from server…', {
        projectId: serverResolverContext.projectId,
        changeSetId: serverResolverContext.changeSetId,
        themeSelections,
        activeSets,
      });

      const resolved = await fetchServerResolvedTokens({
        apiBaseUrl: serverResolverContext.apiBaseUrl,
        projectId: serverResolverContext.projectId,
        changeSetId: serverResolverContext.changeSetId,
        authToken: oauthTokens.accessToken,
        themeSelections,
        activeSets,
      });

      // Dispatch the flat map directly — updateSources merges it on top of local resolution
      if (resolved !== null) {
        dispatch.tokenState.setServerResolvedTokens(resolved);
      }
    }, SERVER_RESOLVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // Deliberately omit buildThemeSelections from deps — theme/activeTheme already cover it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTheme, tokens, usedTokenSet, serverResolverContext, storageProvider, dispatch]);
}
