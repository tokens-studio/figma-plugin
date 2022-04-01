import { createSelector } from '@reduxjs/toolkit';
import { tokenStateSelector } from './tokenStateSelector';

export const lastSyncedStateSelector = createSelector(
  tokenStateSelector,
  (state) => state.lastSyncedState,
);
