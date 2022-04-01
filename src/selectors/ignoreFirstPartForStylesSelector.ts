import { createSelector } from '@reduxjs/toolkit';
import { settingsStateSelector } from './settingsStateSelector';

export const ignoreFirstPartForStylesSelector = createSelector(
  settingsStateSelector,
  (state) => state.ignoreFirstPartForStyles,
);
