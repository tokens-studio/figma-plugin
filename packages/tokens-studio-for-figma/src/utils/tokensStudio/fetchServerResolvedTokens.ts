import { AnyTokenList } from '@/types/tokens';

export interface ServerResolveOptions {
  apiBaseUrl: string;
  projectId: string;
  changeSetId: string;
  authToken: string;
  /** { [themeGroupName]: themeOptionName } — maps active theme selections to server format */
  themeSelections: Record<string, string>;
  /** Array of active token set names */
  activeSets?: string[];
}

/**
 * Fetches server-side resolved tokens from the Studio gRPC-backed REST endpoint.
 *
 *   GET /api/v1/projects/:project_id/resolved_tokens
 *       ?change_set_id=<id>&<themeGroup>=<themeName>&...
 *
 * The server returns a flat delta: only the tokens whose values are affected by the
 * active theme selections. These are merged on top of the locally-resolved full list
 * in `updateSources.tsx`.
 *
 * Returns null on any error so callers fall back to local resolution silently.
 *
 * @param options  - Connection context and theme selections
 * @param _rawTokens - Unused; kept for API compatibility during transition
 */
export async function fetchServerResolvedTokens(
  options: ServerResolveOptions,
  _rawTokens?: Record<string, AnyTokenList>,
): Promise<Record<string, string> | null> {
  const {
    apiBaseUrl, projectId, changeSetId, authToken, themeSelections, activeSets,
  } = options;

  try {
    // Build query string: change_set_id + each theme selection as a flat param
    // e.g. ?change_set_id=abc&color-scheme=blue&foundation=base
    const params = new URLSearchParams({ 
      change_set_id: changeSetId,
      t: Date.now().toString(), // Cache buster
    });
    Object.entries(themeSelections).forEach(([group, option]) => {
      params.set(group, option);
    });
    activeSets?.forEach((set) => {
      params.append('set', set);
    });

    const response = await fetch(
      `${apiBaseUrl}/api/v1/projects/${projectId}/resolved_tokens?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {

      return null;
    }

    const json = await response.json();

    // Server returns: { data: { "token.name": "value", ... }, meta: { ... } }
    const flatMap: Record<string, string> | null = (
      json?.data && typeof json.data === 'object' && !Array.isArray(json.data)
        ? json.data
        : null
    );

    if (!flatMap) {

      return null;
    }


    return flatMap;
  } catch (error) {

    return null;
  }
}
