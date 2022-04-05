import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const changelogSelector = createSelector(
  uiStateSelector,
  (state) => state.changelog,
);
