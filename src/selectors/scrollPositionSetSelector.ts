import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const scrollPositionSetSelector = createSelector(
  uiStateSelector,
  (state) => state.scrollPositionSet,
);
