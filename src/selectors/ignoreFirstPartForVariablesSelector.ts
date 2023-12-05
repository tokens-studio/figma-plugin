import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const ignoreFirstPartForVariablesSelector = createSelector(
  settingsStateSelector,
  (state) => state.ignoreFirstPartForVariables,
);
