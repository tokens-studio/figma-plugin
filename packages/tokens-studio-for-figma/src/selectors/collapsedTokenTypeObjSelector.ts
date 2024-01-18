import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const collapsedTokenTypeObjSelector = createSelector(
  tokenStateSelector,
  (state) => state.collapsedTokenTypeObj,
);
