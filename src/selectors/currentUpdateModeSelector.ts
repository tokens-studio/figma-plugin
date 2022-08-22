import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const currentUpdateModeSelector = createSelector(
  uiStateSelector,
  (state) => state.currentUpdateMode,
);
