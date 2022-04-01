import { createSelector } from '@reduxjs/toolkit';
import { tokenStateSelector } from './tokenStateSelector';

export const activeTokenSetSelector = createSelector(
  tokenStateSelector,
  (state) => state.activeTokenSet,
);
