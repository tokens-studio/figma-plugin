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

  console.log('~~~~~ compareLastSyncedState ~~~~~', { parsedState });

  if (!parsedState) {
    return false;
  }

  const formattedCurrentState = JSON.stringify(compact([removeIdPropertyFromTokens(tokens), themes, format]), null, 2);

  // Only log comparison if the states are not equal
  if (!isEqual(
    lastSyncedState,
    formattedCurrentState,
  )) {
    console.log('***** compareLastSyncedState *****', { lastSyncedState, formattedCurrentState });
    console.log('??? isEqual (excerpt from isEqual.ts) ???', {
      typeOfVals: typeof lastSyncedState !== typeof formattedCurrentState,
      stringCallVals: {}.toString.call(lastSyncedState) != {}.toString.call(formattedCurrentState),
      nonEqualPrimsVal1: lastSyncedState !== Object(lastSyncedState),
      noVal1: !lastSyncedState,
      objectSetVal1: {}.toString.call(lastSyncedState) == '[object Set]',
      objectOjectVal1: {}.toString.call(lastSyncedState) == '[object Object]',
    });
  }

  return isEqual(
    lastSyncedState,
    formattedCurrentState,
  );
}
