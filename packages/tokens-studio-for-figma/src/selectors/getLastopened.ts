import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const getLastopened = createSelector(
  uiStateSelector,
  (state) => state.lastOpened,
);
