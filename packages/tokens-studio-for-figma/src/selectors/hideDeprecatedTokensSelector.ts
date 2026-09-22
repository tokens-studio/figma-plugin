import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const hideDeprecatedTokensSelector = createSelector(
  uiStateSelector,
  (state) => state.hideDeprecatedTokens,
);
