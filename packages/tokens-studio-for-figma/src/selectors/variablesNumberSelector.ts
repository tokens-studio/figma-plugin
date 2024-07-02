import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const variablesNumberSelector = createSelector(
  settingsStateSelector,
  (state) => state.variablesNumber,
);
