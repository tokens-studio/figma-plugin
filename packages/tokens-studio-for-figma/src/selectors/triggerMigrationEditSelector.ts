import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const triggerMigrationEditSelector = createSelector(
  [uiStateSelector],
  (uiState) => uiState.triggerMigrationEdit,
);
