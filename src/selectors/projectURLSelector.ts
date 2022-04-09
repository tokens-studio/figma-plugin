import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const projectURLSelector = createSelector(
  uiStateSelector,
  (state) => state.projectURL,
);
