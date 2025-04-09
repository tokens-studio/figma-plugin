import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const localTokenDataSelector = createSelector(
  tokenStateSelector,
  (state) => ({
    tokens: state.tokens,
    themes: state.themes,
    activeTheme: state.activeTheme,
    usedTokenSet: state.usedTokenSet,
    checkForChanges: state.checkForChanges,
    collapsedTokenSets: state.collapsedTokenSets,
    tokenFormat: state.tokenFormat,
  }),
);
