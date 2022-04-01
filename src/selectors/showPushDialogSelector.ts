import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const showPushDialogSelector = createSelector(
  uiStateSelector,
  (state) => state.showPushDialog,
);
