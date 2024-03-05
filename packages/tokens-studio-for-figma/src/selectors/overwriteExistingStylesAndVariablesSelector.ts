import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const overwriteExistingStylesAndVariablesSelector = createSelector(
  settingsStateSelector,
  (state) => state.overwriteExistingStylesAndVariables,
);
