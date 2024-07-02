import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const removeStylesAndVariablesWithoutConnectionSelector = createSelector(
  settingsStateSelector,
  (state) => state.removeStylesAndVariablesWithoutConnection,
);
