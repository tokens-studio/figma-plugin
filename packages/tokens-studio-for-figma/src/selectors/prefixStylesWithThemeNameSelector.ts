import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const prefixStylesWithThemeNameSelector = createSelector(
  settingsStateSelector,
  (state) => state.prefixStylesWithThemeName,
);
