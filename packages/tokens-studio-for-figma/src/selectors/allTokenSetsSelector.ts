import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const allTokenSetsSelector = createSelector(
  tokenStateSelector,
  (tokenState) => Object.keys(tokenState.tokens),
);
