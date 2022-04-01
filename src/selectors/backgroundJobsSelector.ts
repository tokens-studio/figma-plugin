import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const backgroundJobsSelector = createSelector(
  uiStateSelector,
  (state) => state.backgroundJobs,
);
