import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const skipDeprecatedTokensInVariableSyncSelector = createSelector(
  settingsStateSelector,
  (state) => state.skipDeprecatedTokensInVariableSync,
);
