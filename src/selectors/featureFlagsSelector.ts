import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const featureFlagsSelector = createSelector(
  uiStateSelector,
  (state) => state.featureFlags,
);
