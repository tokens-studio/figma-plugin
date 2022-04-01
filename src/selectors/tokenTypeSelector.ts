import { createSelector } from '@reduxjs/toolkit';
import { settingsStateSelector } from './settingsStateSelector';

export const tokenTypeSelector = createSelector(
  settingsStateSelector,
  (state) => state.tokenType,
);
