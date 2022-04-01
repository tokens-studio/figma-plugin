import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const storageTypeSelector = createSelector(
  uiStateSelector,
  (state) => state.storageType,
);
