import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const showBitbucketMigrationDialogSelector = createSelector(
  [uiStateSelector],
  (uiState) => uiState.showBitbucketMigrationDialog,
);
