import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const activeTabSelector = createSelector(
  uiStateSelector,
  (state) => state.activeTab,
);
