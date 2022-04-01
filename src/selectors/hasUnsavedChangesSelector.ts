import { createSelector } from '@reduxjs/toolkit';
import { tokenStateSelector } from './tokenStateSelector';

export const hasUnsavedChangesSelector = createSelector(
  tokenStateSelector,
  (state) => state.hasUnsavedChanges,
);
