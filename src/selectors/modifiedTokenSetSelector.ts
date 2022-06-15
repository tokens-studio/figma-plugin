import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const modifiedTokenSetSelector = createSelector(
  tokenStateSelector,
  (state) => state.modifiedTokenSet,
);
