import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const variablesColorSelector = createSelector(
  settingsStateSelector,
  (state) => state.variablesColor,
);
