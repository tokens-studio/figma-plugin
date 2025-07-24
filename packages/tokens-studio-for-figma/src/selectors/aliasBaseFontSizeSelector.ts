import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const aliasBaseFontSizeSelector = createSelector(
  settingsStateSelector,
  (state) => state.aliasBaseFontSize,
);
