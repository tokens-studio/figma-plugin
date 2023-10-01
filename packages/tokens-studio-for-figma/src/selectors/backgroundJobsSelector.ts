import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const backgroundJobsSelector = createSelector(
  uiStateSelector,
  (state) => state.backgroundJobs,
);
