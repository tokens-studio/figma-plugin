import { ThemeObject } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { fetchServerResolvedTokens } from './fetchServerResolvedTokens';

export interface PerThemeServerResolveContext {
  apiBaseUrl: string;
  projectId: string;
  changeSetId: string;
  authToken: string;
}

/**
 * Build { [themeGroupName]: themeOptionName } for a single target theme, using
 * the current active theme selections as the baseline for OTHER groups and
 * forcing the target theme's own group to its option name. This guarantees the
 * server resolves values for THIS mode, not the currently active mode.
 */
function buildSelectionsForTheme(
  theme: ThemeObject,
  activeTheme: Record<string, string>,
  themes: ThemeObject[],
): Record<string, string> {
  const selections: Record<string, string> = {};
  Object.entries(activeTheme).forEach(([groupId, optionId]) => {
    const match = themes.find((t) => t.id === optionId);
    if (match) {
      selections[match.group || groupId] = match.name;
    }
  });
  selections[theme.group || theme.id] = theme.name;
  return selections;
}

/**
 * Fetches server-resolved token deltas independently for each selected theme,
 * so that a multi-mode variable export writes the correct values per mode.
 *
 * Returns a map keyed by theme.id → flat { tokenName: value } delta, or null
 * when nothing resolved (callers then fall back to local resolution).
 */
export async function fetchServerResolvedTokensPerTheme(
  selectedThemes: ThemeObject[],
  activeTheme: Record<string, string>,
  themes: ThemeObject[],
  context: PerThemeServerResolveContext,
): Promise<Record<string, Record<string, string>> | null> {
  if (!selectedThemes.length) return null;

  const entries = await Promise.all(
    selectedThemes.map(async (theme) => {
      const themeSelections = buildSelectionsForTheme(theme, activeTheme, themes);
      const activeSets = Object.entries(theme.selectedTokenSets)
        .filter(([, status]) => status === TokenSetStatus.ENABLED)
        .map(([name]) => name);
      const resolved = await fetchServerResolvedTokens({
        ...context,
        themeSelections,
        activeSets,
      });
      return [theme.id, resolved] as const;
    }),
  );

  const result: Record<string, Record<string, string>> = {};
  let anyResolved = false;
  for (const [id, resolved] of entries) {
    if (resolved) {
      result[id] = resolved;
      anyResolved = true;
    }
  }
  return anyResolved ? result : null;
}
