import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { SetTokenDataPayload } from '@/types/payloads';
import parseTokenValues from '@/utils/parseTokenValues';
import type { TokenState } from '../../tokenState';

export function setTokenData(state: TokenState, payload: SetTokenDataPayload): TokenState {
  const values = parseTokenValues(payload.values);
  const allAvailableTokenSets = Object.keys(values);
  const usedTokenSets = Object.fromEntries(
    allAvailableTokenSets
      .map((tokenSet) => ([tokenSet, payload.usedTokenSet?.[tokenSet] ?? TokenSetStatus.DISABLED])),
  );
  // @README (1) for the sake of normalization we will set the DISABLED status for all available token sets
  // this way we can always be certain the status is available. This behavior is also reflected in the createTokenSet logic
  return {
    ...state,
    tokens: values,
    themes: payload.themes,
    activeTheme: payload.activeTheme,
    activeTokenSet: Array.isArray(payload.values) ? 'global' : Object.keys(payload.values)[0],
    usedTokenSet: Array.isArray(payload.values)
      ? { global: TokenSetStatus.ENABLED }
      : usedTokenSets,
  };
}
