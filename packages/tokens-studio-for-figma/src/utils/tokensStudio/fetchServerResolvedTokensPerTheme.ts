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
 * Build { [themeGroupName]: themeOptionName } for a single target theme.
 *
 * Only the target theme's own group is included. Other groups are
 * intentionally omitted so the result of an export depends solely on the
 * export selection, not on transient UI state (which theme happens to be
 * active in the plugin at the moment of export). Any cross-group aliases the
 * server can't resolve without those dimensions fall through to local
 * resolution, which is deterministic against the theme's own selectedTokenSets.
 */
function buildSelectionsForTheme(theme: ThemeObject): Record<string, string> {
  return { [theme.group || theme.name]: theme.name };
}

/**
 * Fetches server-resolved token deltas independently for each selected theme,
 * so that a multi-mode variable export writes the correct values per mode.
 *
 * Returns a map keyed by theme.id → flat { tokenName: value } delta. If ANY
 * theme's fetch fails, the entire result is null and the caller falls back
 * to local resolution for every theme — mixing server-resolved and locally-
 * resolved modes in a single export would be worse than either extreme.
 */
export async function fetchServerResolvedTokensPerTheme(
  selectedThemes: ThemeObject[],
  context: PerThemeServerResolveContext,
): Promise<Record<string, Record<string, string>> | null> {
  if (!selectedThemes.length) return null;

  const entries = await Promise.all(
    selectedThemes.map(async (theme) => {
      const themeSelections = buildSelectionsForTheme(theme);
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

  // All-or-nothing: a partial map would silently mix server-resolved and
  // local resolution across modes within one export.
  if (entries.some(([, resolved]) => resolved === null)) return null;

  const result: Record<string, Record<string, string>> = {};
  for (const [id, resolved] of entries) {
    result[id] = resolved!;
  }
  return result;
}
