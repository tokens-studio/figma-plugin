import compact from 'just-compact';
import { isEqual } from './isEqual';
import { tryParseJson } from './tryParseJson';
import type { ThemeObjectsList } from '@/types';
import type { AnyTokenList } from '@/types/tokens';

export type LastSyncedState<Metadata = null> =
  [Record<string, AnyTokenList>]
  | [Record<string, AnyTokenList>, ThemeObjectsList]
  | [Record<string, AnyTokenList>, ThemeObjectsList, Metadata];

export function compareLastSyncedState<Metadata = null>(
  tokens: Record<string, AnyTokenList>,
  themes: ThemeObjectsList,
  metadata: Metadata,
  lastSyncedState: string,
  defaultSyncedState: LastSyncedState<Metadata>,
) {
  const parsedState = tryParseJson<LastSyncedState<Metadata>>(lastSyncedState);
  if (!parsedState) {
    return false;
  }
  return isEqual(
    compact([parsedState[0] ?? defaultSyncedState[0], parsedState[1] ?? defaultSyncedState[1], parsedState[2] ?? defaultSyncedState[2]]),
    compact([tokens, themes, metadata ?? defaultSyncedState[2]]),
  );
}
