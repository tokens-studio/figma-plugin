import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const projectURLSelector = createSelector(
  uiStateSelector,
  (state) => state.projectURL,
);
