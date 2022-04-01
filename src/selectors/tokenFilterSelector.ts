import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const tokenFilterSelector = createSelector(
  uiStateSelector,
  (state) => state.tokenFilter,
);
