import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const ignoreFirstPartForStylesSelector = createSelector(
  settingsStateSelector,
  (state) => state.ignoreFirstPartForStyles,
);
