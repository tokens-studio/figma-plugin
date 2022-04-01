import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const collapsedSelector = createSelector(
  uiStateSelector,
  (state) => state.collapsed,
);
