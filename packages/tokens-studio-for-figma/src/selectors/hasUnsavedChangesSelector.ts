import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const hasUnsavedChangesSelector = createSelector(
  tokenStateSelector,
  (state) => state.hasUnsavedChanges,
);
