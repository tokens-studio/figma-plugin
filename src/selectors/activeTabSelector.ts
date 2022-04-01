import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const activeTabSelector = createSelector(
  uiStateSelector,
  (state) => state.activeTab,
);
