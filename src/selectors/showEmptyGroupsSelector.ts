import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const showEmptyGroupsSelector = createSelector(
  uiStateSelector,
  (state) => state.showEmptyGroups,
);
