import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const tokenGroupDescriptionSelector = createSelector(
  tokenStateSelector,
  (state) => state.tokenGroupDescription,
);
