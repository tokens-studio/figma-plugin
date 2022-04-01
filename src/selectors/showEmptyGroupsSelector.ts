import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const showEmptyGroupsSelector = createSelector(
  uiStateSelector,
  (state) => state.showEmptyGroups,
);
