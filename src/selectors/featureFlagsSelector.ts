import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const featureFlagsSelector = createSelector(
  uiStateSelector,
  (state) => ({ gh_mfs_enabled: true }) || state.featureFlags,
);
