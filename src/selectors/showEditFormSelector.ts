import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const showEditFormSelector = createSelector(
  uiStateSelector,
  (state) => state.showEditForm,
);
