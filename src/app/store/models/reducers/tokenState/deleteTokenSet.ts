import omit from 'just-omit';
import type { TokenState } from '../../tokenState';

export function deleteTokenSet(state: TokenState, name: string): TokenState {
  const oldTokens = { ...state.tokens };
  delete oldTokens[name];
  return {
    ...state,
    tokens: oldTokens,
    // @README remove the tokenset from themes
    themes: state.themes.map((theme) => {
      if (name in theme.selectedTokenSets) {
        return {
          ...theme,
          selectedTokenSets: omit({ ...theme.selectedTokenSets }, name),
        };
      }
      return theme;
    }),
    activeTokenSet: state.activeTokenSet === name
      ? Object.keys(state.tokens)[0]
      : state.activeTokenSet,
    usedTokenSet: omit({ ...state.usedTokenSet }, name),
  };
}
