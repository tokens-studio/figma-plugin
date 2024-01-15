import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { SetTokenDataPayload } from '@/types/payloads';
import parseTokenValues from '@/utils/parseTokenValues';
import type { TokenState } from '../../tokenState';
import addIdPropertyToTokens from '@/utils/addIdPropertyToTokens';
import { Tokens, detectFormat } from '@/utils/convertTokens';

export function setTokenData(state: TokenState, payload: SetTokenDataPayload): TokenState {
  console.log('setting token data', payload);

  const format = detectFormat(payload.values as Tokens);
  const values = parseTokenValues(payload.values);
  const allAvailableTokenSets = Object.keys(values);
  const usedTokenSets = Object.fromEntries(
    allAvailableTokenSets
      .map((tokenSet) => ([tokenSet, payload.usedTokenSet?.[tokenSet] ?? TokenSetStatus.DISABLED])),
  );
  const newActiveTheme = payload.activeTheme;
  Object.entries(newActiveTheme ?? {}).forEach(([group, activeTheme]) => {
    if (!payload.themes?.find((t) => t.id === activeTheme) && newActiveTheme) {
      delete newActiveTheme[group];
    }
  });

  // @README (1) for the sake of normalization we will set the DISABLED status for all available token sets
  // this way we can always be certain the status is available. This behavior is also reflected in the createTokenSet logic
  return {
    ...state,
    tokenFormat: format,
    tokens: addIdPropertyToTokens(values),
    themes: (payload.themes ?? []).map((theme) => ({
      ...theme,
      selectedTokenSets: Object.fromEntries(
        Object.entries(theme.selectedTokenSets)
          .filter(([setName, status]) => (
            allAvailableTokenSets.includes(setName) && status !== TokenSetStatus.DISABLED
          )),
      ),
    })),
    activeTheme: newActiveTheme ?? {},
    ...(Object.keys(payload.values).includes(state.activeTokenSet) ? {} : {
      activeTokenSet: Array.isArray(payload.values) ? 'global' : Object.keys(payload.values)[0],
    }),
    usedTokenSet: Array.isArray(payload.values)
      ? { global: TokenSetStatus.ENABLED }
      : usedTokenSets,
  };
}
