import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

// Needed to add a flag if all nodes should be updated, as otherwise all nodes are updated when we launch the plugin which we dont want to do. Feel free to refactor this.
// This flag is only needed in the effects file, but we're declaring properties here
export function setActiveTheme(state: TokenState, { themeId }: { themeId: string | null, shouldUpdateNodes?: boolean }): TokenState {
  const themeObject = themeId ? state.themes.find((theme) => theme.id === themeId) : null;
  const usedTokenSetsMap = themeObject
    ? Object.fromEntries(
      Object.keys(state.tokens).map((tokenSet) => (
        [tokenSet, themeObject.selectedTokenSets?.[tokenSet] ?? TokenSetStatus.DISABLED]
      )),
    )
    : Object.fromEntries(
      Object.keys(state.tokens).map((tokenSet) => (
        [tokenSet, TokenSetStatus.DISABLED]
      )),
    );

  return {
    ...state,
    usedTokenSet: usedTokenSetsMap,
    activeTheme: themeId,
  };
}
