import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const stylesGradientSelector = createSelector(
  settingsStateSelector,
  (state) => state.stylesGradient,
);
