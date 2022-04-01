import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const displayTypeSelector = createSelector(
  uiStateSelector,
  (state) => state.displayType,
);
