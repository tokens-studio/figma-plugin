import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const showPushDialogSelector = createSelector(
  uiStateSelector,
  (state) => state.showPushDialog,
);
