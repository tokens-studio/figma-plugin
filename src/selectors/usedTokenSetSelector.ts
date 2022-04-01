import { createSelector } from '@reduxjs/toolkit';
import { tokenStateSelector } from './tokenStateSelector';

export const usedTokenSetSelector = createSelector(
  tokenStateSelector,
  (state) => state.usedTokenSet,
);
