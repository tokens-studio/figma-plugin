import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const showPullDialogSelector = createSelector(
  uiStateSelector,
  (state) => state.showPullDialog,
);
