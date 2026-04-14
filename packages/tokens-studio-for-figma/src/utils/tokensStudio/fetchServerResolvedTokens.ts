import { AnyTokenList } from '@/types/tokens';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';

export interface ServerResolveOptions {
  apiBaseUrl: string;
  projectId: string;
  changeSetId: string;
  authToken: string;
  /** { [themeGroupName]: themeOptionName } — maps active theme selections to server format */
  themeSelections: Record<string, string>;
}

/**
 * Response shape from the Studio server's resolved_tokens endpoint.
 * The server returns a flat map of token name → resolved value.
 * Exact shape may include `data.tokens` or be a flat object — we normalise both.
 */
interface ServerResolvedTokensResponse {
  data?: {
    tokens?: Record<string, unknown>;
    [key: string]: unknown;
  };
  tokens?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Fetches server-side resolved tokens from the Studio gRPC-backed REST endpoint.
 *
 * The Studio server runs a Go gRPC resolver behind the scenes and exposes it via:
 *   POST /api/v1/projects/:project_id/resolved_tokens
 *
 * Returns null on any error so callers can fall back to local resolution.
 *
 * @param options - Connection context and theme selections
 * @param rawTokens - The raw (unresolved) token sets from Redux state, used to
 *                    enrich the server's flat value map with type/metadata that
 *                    are not present in the server response.
 */
export async function fetchServerResolvedTokens(
  options: ServerResolveOptions,
  rawTokens: Record<string, AnyTokenList>,
): Promise<ResolveTokenValuesResult[] | null> {
  const {
    apiBaseUrl, projectId, changeSetId, authToken, themeSelections,
  } = options;

  try {
    const response = await fetch(
      `${apiBaseUrl}/api/v1/projects/${projectId}/resolved_tokens`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          change_set_id: changeSetId,
          theme_selections: themeSelections,
        }),
      },
    );

    if (!response.ok) {
      console.warn(
        `[ServerResolver] Server returned ${response.status} ${response.statusText} — falling back to local resolver`,
      );
      return null;
    }

    const json: ServerResolvedTokensResponse = await response.json();

    // Normalise: server may return { data: { tokens: {...} } } or { tokens: {...} } or a flat map
    const flatMap: Record<string, unknown> = (json.data?.tokens ?? json.tokens ?? json) as Record<string, unknown>;

    if (!flatMap || typeof flatMap !== 'object') {
      console.warn('[ServerResolver] Unexpected response shape — falling back to local resolver');
      return null;
    }

    // Build a quick lookup: tokenName → raw token (for type + metadata)
    const rawTokenByName = new Map<string, { type: string; [key: string]: unknown }>();
    Object.values(rawTokens).forEach((set) => {
      set.forEach((token) => {
        if (token.name && !rawTokenByName.has(token.name)) {
          rawTokenByName.set(token.name, token as { type: string; [key: string]: unknown });
        }
      });
    });

    // Convert flat map { tokenName: resolvedValue } → ResolveTokenValuesResult[]
    const resolved: ResolveTokenValuesResult[] = Object.entries(flatMap).map(([name, value]) => {
      const rawToken = rawTokenByName.get(name);
      return {
        // Spread the original raw token to preserve name, type, description, $extensions, etc.
        ...(rawToken ?? {}),
        name,
        value,
        // rawValue is the original alias/value before resolution
        rawValue: rawToken?.value ?? value,
        // Mark as successfully resolved
        failedToResolve: false,
      } as unknown as ResolveTokenValuesResult;
    });

    console.log(`[ServerResolver] Received ${resolved.length} resolved tokens from server`);
    return resolved;
  } catch (error) {
    console.warn('[ServerResolver] Network error — falling back to local resolver:', error);
    return null;
  }
}
