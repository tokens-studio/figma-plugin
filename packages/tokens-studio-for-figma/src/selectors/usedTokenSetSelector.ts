import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const usedTokenSetSelector = createSelector(
  tokenStateSelector,
  (state) => state.usedTokenSet,
);
