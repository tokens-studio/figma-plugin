import compact from 'just-compact';
import { isEqual } from './isEqual';
import { tryParseJson } from './tryParseJson';
import type { ThemeObjectsList } from '@/types';
import type { AnyTokenList } from '@/types/tokens';
import removeIdPropertyFromTokens from './removeIdPropertyFromTokens';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

export type LastSyncedState =
  [Record<string, AnyTokenList>]
  | [Record<string, AnyTokenList>, ThemeObjectsList]
  | [Record<string, AnyTokenList>, ThemeObjectsList, TokenFormatOptions];

// Reads the token format recorded at the last successful sync (index 2 of the
// serialized tuple). Returns undefined for missing/malformed state or a value
// that isn't a known TokenFormatOptions — callers treat undefined as "unknown,
// assume aligned" to avoid spurious full-repo rewrites.
export function getLastSyncedFormat(lastSyncedState: string): TokenFormatOptions | undefined {
  if (!lastSyncedState) return undefined;
  const parsed = tryParseJson<LastSyncedState>(lastSyncedState);
  if (!Array.isArray(parsed) || parsed.length < 3) return undefined;
  const format = parsed[2];
  return Object.values(TokenFormatOptions).includes(format as TokenFormatOptions)
    ? (format as TokenFormatOptions)
    : undefined;
}

export function compareLastSyncedState(
  tokens: Record<string, AnyTokenList>,
  themes: ThemeObjectsList,
  lastSyncedState: string,
  format: TokenFormatOptions,
) {
  const parsedState = tryParseJson<LastSyncedState>(lastSyncedState);

  if (!parsedState) {
    return false;
  }

  const formattedCurrentState = JSON.stringify(compact([removeIdPropertyFromTokens(tokens), themes, format]), null, 2);

  return isEqual(
    lastSyncedState,
    formattedCurrentState,
  );
}
