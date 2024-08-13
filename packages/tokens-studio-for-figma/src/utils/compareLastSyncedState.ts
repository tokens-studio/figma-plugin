import compact from 'just-compact';
import { isEqual } from './isEqual';
import { tryParseJson } from './tryParseJson';
import type { ThemeObjectsList } from '@/types';
import type { AnyTokenList } from '@/types/tokens';
import removeIdPropertyFromTokens from './removeIdPropertyFromTokens';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

export type LastSyncedState =
  [Record<string, AnyTokenList>]
  | [Record<string, AnyTokenList>, ThemeObjectsList];

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
