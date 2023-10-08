import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const collapsedTokenSetsSelector = createSelector(
  tokenStateSelector,
  (state) => state.collapsedTokenSets,
);
