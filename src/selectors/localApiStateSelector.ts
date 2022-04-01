import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const localApiStateSelector = createSelector(
  uiStateSelector,
  (state) => state.localApiState,
);
