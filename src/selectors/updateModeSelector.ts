import { createSelector } from '@reduxjs/toolkit';
import { UpdateMode } from '@/types/state';
import { settingsStateSelector } from './settingsStateSelector';

export const updateModeSelector = createSelector(
  settingsStateSelector,
  (state) => state.updateMode ?? UpdateMode.PAGE,
);
