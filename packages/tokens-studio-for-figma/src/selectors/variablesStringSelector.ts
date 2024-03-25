import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const variablesStringSelector = createSelector(
  settingsStateSelector,
  (state) => state.variablesString,
);
