import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const collapsedTokensSelector = createSelector(
  tokenStateSelector,
  (state) => state.collapsedTokens,
);
