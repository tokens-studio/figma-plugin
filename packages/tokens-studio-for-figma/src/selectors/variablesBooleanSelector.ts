import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const variablesBooleanSelector = createSelector(
  settingsStateSelector,
  (state) => state.variablesBoolean,
);
