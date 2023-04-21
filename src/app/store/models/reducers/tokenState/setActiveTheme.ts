import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

// Needed to add a flag if all nodes should be updated, as otherwise all nodes are updated when we launch the plugin which we dont want to do. Feel free to refactor this.
// This flag is only needed in the effects file, but we're declaring properties here
export function setActiveTheme(state: TokenState, { activeThemeObj }: { activeThemeObj: Record<string, string>, shouldUpdateNodes?: boolean }): TokenState {
  const themeObjectList = state.themes.filter((theme) => Object.values(activeThemeObj).some((v) => v === theme.id));
  // Store all activeTokenSets through all activeThemes
  const selectedTokenSets: Record<string, TokenSetStatus> = {};
  themeObjectList.forEach((theme) => {
    Object.entries(theme.selectedTokenSets).forEach(([tokenSet, status]) => {
      if (status !== TokenSetStatus.DISABLED) {
        selectedTokenSets[tokenSet] = status;
      }
    });
  });

  const usedTokenSetsMap = themeObjectList.length > 0
    ? Object.fromEntries(
      Object.keys(state.tokens).map((tokenSet) => (
        [tokenSet, selectedTokenSets?.[tokenSet] ?? TokenSetStatus.DISABLED]
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
    activeTheme: activeThemeObj,
  };
}
