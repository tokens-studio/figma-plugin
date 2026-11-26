import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';
import { isTokensStudioSyncSelector } from './isTokensStudioSyncSelector';

// The persisted setting is left untouched so it comes back when switching away
// from Tokens Studio sync, but it's never effective while Studio is active.
export const exportExtendedCollectionsSelector = createSelector(
  settingsStateSelector,
  isTokensStudioSyncSelector,
  (state, isTokensStudioSync) => !isTokensStudioSync && !!state.exportExtendedCollections,
);
