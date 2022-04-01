import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const featureFlagsSelector = createSelector(
  uiStateSelector,
  (state) => state.featureFlags,
);
