import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const baseFontSizeSelector = createSelector(
  settingsStateSelector,
  (state) => state.baseFontSize,
);
