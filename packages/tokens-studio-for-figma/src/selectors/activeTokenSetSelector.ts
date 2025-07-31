import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const activeTokenSetSelector = createSelector(
  tokenStateSelector,
  (tokenState) => tokenState.activeTokenSet,
);
