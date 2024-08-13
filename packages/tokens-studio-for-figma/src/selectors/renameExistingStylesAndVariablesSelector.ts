import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const renameExistingStylesAndVariablesSelector = createSelector(
  settingsStateSelector,
  (state) => state.renameExistingStylesAndVariables,
);
