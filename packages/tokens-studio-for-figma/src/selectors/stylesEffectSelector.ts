import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const stylesEffectSelector = createSelector(
  settingsStateSelector,
  (state) => state.stylesEffect,
);
