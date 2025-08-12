import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const lastErrorSelector = createSelector(
  uiStateSelector,
  (uiState) => uiState.lastError,
);
