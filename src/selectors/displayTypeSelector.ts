import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const displayTypeSelector = createSelector(
  uiStateSelector,
  (state) => state.displayType,
);
