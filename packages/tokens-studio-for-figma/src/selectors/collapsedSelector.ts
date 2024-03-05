import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const collapsedSelector = createSelector(
  uiStateSelector,
  (state) => state.collapsed,
);
