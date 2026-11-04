import { appendTypeToToken } from '@/app/components/createTokenObj';
import { SingleToken } from '@/types/tokens';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { getTokenSetsOrder } from './getTokenSetsOrder';

export type ResolveTokenValuesResult = SingleToken<
true,
{
  failedToResolve?: boolean;
}
>;

export function getOverallConfig(themes: ThemeObject[], selectedThemes: string[]) {
  return selectedThemes.reduce((acc, themeId) => {
    const currentTheme = themes.find((theme) => theme.id === themeId);
    if (!currentTheme) return acc;

    Object.entries(currentTheme.selectedTokenSets).forEach(([tokenSet, status]) => {
      // If the set is enabled, set it. Meaning, it should always win.
      if (status === TokenSetStatus.ENABLED) {
        acc[tokenSet] = status;
        // If the set is source, only set it to source if it wasnt set to enabled.
      } else if (status === TokenSetStatus.SOURCE && acc[tokenSet] !== TokenSetStatus.ENABLED) {
        acc[tokenSet] = status;
      }
    });
    return acc;
  }, {} as Record<string, TokenSetStatus>);
}

export function getEnabledTokenSets(usedSets: UsedTokenSetsMap = {}) {
  return Object.keys(usedSets)
    .filter((key) => usedSets[key] === TokenSetStatus.ENABLED)
    .map((tokenSet) => tokenSet);
}

export function mergeTokenGroups(
  tokens: Record<string, SingleToken[]>,
  usedSets: UsedTokenSetsMap = {},
  overallConfig: UsedTokenSetsMap = {},
  activeTokenSet?: string,
): SingleToken[] {
  const { tokenSetsOrder, usedSetsList, overallSets } = getTokenSetsOrder(
    tokens,
    usedSets,
    overallConfig,
    activeTokenSet,
  );

  // Helper to determine if a token should be merged. We only merge object tokens if the current set is enabled (to avoid accidental merges)
  const shouldMerge = (currentSet: string, existingToken: SingleToken) => usedSetsList.includes(currentSet)
    && existingToken.internal__Parent
    && !overallSets.includes(existingToken.internal__Parent);

  return tokenSetsOrder.reduce((mergedTokens, setName) => {
    const setTokens = tokens[setName] || [];
    setTokens.forEach((token) => {
      const existingIndex = mergedTokens.findIndex((t) => t.name === token.name);
      const existingToken = mergedTokens[existingIndex];
      const newToken = {
        ...appendTypeToToken(token),
        internal__Parent: setName,
      } as SingleToken;

      if (existingIndex === -1) {
        // If the token does not exist yet, add it.
        mergedTokens.push(newToken);
      } else if (
        shouldMerge(setName, existingToken)
        && existingIndex > -1
        && typeof existingToken.value === 'object'
        && typeof newToken.value === 'object'
        && !Array.isArray(existingToken.value)
        && !Array.isArray(newToken.value)
      ) {
        // If the token should be merged, and is an object - and not an array, merge them (e.g. composition, typography)
        mergedTokens.splice(existingIndex, 1, {
          ...newToken,
          value: {
            ...existingToken.value,
            ...newToken.value,
          },
        } as SingleToken);
      } else {
        // In all other cases, just replace.
        mergedTokens[existingIndex] = newToken;
      }
    });
    return mergedTokens;
  }, [] as SingleToken[]);
}
// Restores the types JSON would have given: plain numbers, booleans and null. Values with units
// or other text (`1rem`, `100%`, `Inter`) stay strings.
function coerceUnquotedPrimitive(value: string): string | number | boolean | null {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

/**
 * Parses a composite value that is not valid JSON, in the unquoted form the Studio server
 * returns: `{fontFamily: Inter, fontSize: 1rem, ...}`. A segment without a `key:` prefix
 * belongs to the previous value, so values containing commas (e.g. font stacks) survive.
 * Only flat objects are supported: nested values would be split on their inner commas.
 */
function parseUnquotedObject(value: string): Record<string, string | number | boolean | null> | null {
  if (!value.startsWith('{') || !value.endsWith('}')) return null;
  const body = value.slice(1, -1);
  if (/[{}[\]]/.test(body)) return null;
  const result: Record<string, string> = {};
  let lastKey: string | null = null;
  body.split(',').forEach((segment) => {
    const match = segment.match(/^\s*([A-Za-z_$][\w$-]*)\s*:\s*(.*?)\s*$/);
    if (match) {
      const [, key, val] = match;
      lastKey = key;
      result[key] = val;
    } else if (lastKey) {
      result[lastKey] = `${result[lastKey]},${segment}`.trim();
    }
  });
  if (Object.keys(result).length === 0) return null;
  return Object.fromEntries(Object.entries(result).map(([key, val]) => [key, coerceUnquotedPrimitive(val)]));
}

/**
 * Turns a server-resolved composite value back into an object.
 *
 * Valid JSON replaces the local value as is: the server is the source of truth, and merging
 * would stop it from clearing a property by omitting it.
 *
 * The unquoted fallback only applies to typography, whose values are flat and which reads
 * properties straight off the value (e.g. `value.fontFamily`), so a string would silently drop
 * the apply. It is merged onto the local value because losing a property breaks the apply.
 * Other types keep the string: their consumers handle it, e.g. gradients fall back to rawValue.
 */
function parseServerCompositeValue(serverValue: string, token: ResolveTokenValuesResult): SingleToken['value'] {
  try {
    return JSON.parse(serverValue);
  } catch {
    if (token.type !== TokenTypes.TYPOGRAPHY) return serverValue;
    const parsed = parseUnquotedObject(serverValue);
    return (parsed ? { ...(token.value as Record<string, unknown>), ...parsed } : token.value) as SingleToken['value'];
  }
}

/**
 * Merges server-side resolved tokens (gRPC delta) on top of locally-resolved tokens.
 * Only tokens present in the server delta are updated; others retain their local values.
 *
 * @param locallyResolved - List of tokens resolved by the local TokenResolver
 * @param serverResolvedTokens - Flat map of { tokenName: "resolvedValue" } from the Studio server
 */
export function mergeServerResolvedTokens(
  locallyResolved: ResolveTokenValuesResult[],
  serverResolvedTokens?: Record<string, string> | null,
): ResolveTokenValuesResult[] {
  if (!locallyResolved || !serverResolvedTokens || Object.keys(serverResolvedTokens).length === 0) {
    return locallyResolved;
  }

  // First pass: update tokens that are directly named in the server delta.
  const firstPass = locallyResolved.map((token) => {
    const serverValue = serverResolvedTokens[token.name];
    if (serverValue !== undefined) {
      // Composite tokens (typography, border, shadow) come back from the server as a
      // JSON-stringified object. Their local value is an object, so we must parse the
      // string back into an object — otherwise downstream code reads properties off a
      // string (e.g. `value.fontFamily`) and gets `undefined`, silently dropping the apply.
      let nextValue: SingleToken['value'] = serverValue;
      if (
        typeof serverValue === 'string'
        && typeof token.value === 'object'
        && token.value !== null
        && (serverValue.startsWith('{') || serverValue.startsWith('['))
      ) {
        nextValue = parseServerCompositeValue(serverValue, token);
      }
      return {
        ...token,
        value: nextValue,
        failedToResolve: false,
      } as ResolveTokenValuesResult;
    }
    return token;
  });

  // Second pass: re-resolve composite tokens (typography, border) whose individual
  // properties reference atomic tokens that were updated in the server delta.
  // Without this step, e.g. a typography token referencing {fontFamily.brand} keeps its
  // locally-resolved (possibly stale or unresolved) value even after fontFamily.brand is
  // updated by the server.
  // Note: array-valued tokens (e.g. multi-layer shadow) are not re-resolved here because
  // nested reference matching inside array elements is not yet implemented.
  return firstPass.map((token) => {
    const rawValue = token.resolvedValueWithReferences;
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return token;
    }

    let needsUpdate = false;
    const currentValue: Record<string, unknown> = typeof token.value === 'object' && token.value !== null && !Array.isArray(token.value)
      ? { ...(token.value as Record<string, unknown>) }
      : {};

    for (const [key, val] of Object.entries(rawValue as Record<string, unknown>)) {
      // Match simple {tokenName} references (no nesting)
      if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}') && !val.slice(1, -1).includes('{')) {
        const refName = val.slice(1, -1);
        const serverValue = serverResolvedTokens[refName];
        if (serverValue !== undefined) {
          currentValue[key] = serverValue;
          needsUpdate = true;
        }
      }
    }

    if (!needsUpdate) return token;
    return {
      ...token,
      value: currentValue,
      failedToResolve: false,
    } as ResolveTokenValuesResult;
  });
}
