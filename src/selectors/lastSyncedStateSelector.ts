import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const lastSyncedStateSelector = createSelector(
  tokenStateSelector,
  (state) => state.lastSyncedState,
);
