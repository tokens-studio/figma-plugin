import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const activeTokensTabSelector = createSelector(
  uiStateSelector,
  (state) => state.activeTokensTab,
);
