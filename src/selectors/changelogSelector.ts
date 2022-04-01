import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const changelogSelector = createSelector(
  uiStateSelector,
  (state) => state.changelog,
);
