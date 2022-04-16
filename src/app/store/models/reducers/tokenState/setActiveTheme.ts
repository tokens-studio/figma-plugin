import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

export function setActiveTheme(state: TokenState, themeId: string | null): TokenState {
  const themeObject = themeId ? state.themes?.[themeId] : null;
  const usedTokenSetsMap = themeObject
    ? Object.fromEntries(
      Object.keys(state.tokens).map((tokenSet) => (
        [tokenSet, themeObject.selectedTokenSets?.[tokenSet] ?? TokenSetStatus.DISABLED]
      )),
    )
    : state.usedTokenSet;

  return {
    ...state,
    usedTokenSet: usedTokenSetsMap,
    activeTheme: themeId,
  };
}
