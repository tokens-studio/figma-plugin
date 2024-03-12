import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const stylesTypographySelector = createSelector(
  settingsStateSelector,
  (state) => state.stylesTypography,
);
