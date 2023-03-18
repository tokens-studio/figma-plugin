import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const inheritTypeTokenSelector = createSelector(
  tokenStateSelector,
  (state) => state.inheritTypeTokens,
);
