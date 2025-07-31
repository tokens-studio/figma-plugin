import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const stringTokensSelector = createSelector(
  tokenStateSelector,
  (state) => state.stringTokens,
);
