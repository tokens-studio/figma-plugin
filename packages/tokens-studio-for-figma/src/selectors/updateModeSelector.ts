import { createSelector } from 'reselect';
import { UpdateMode } from '@/constants/UpdateMode';
import { settingsStateSelector } from './settingsStateSelector';

export const updateModeSelector = createSelector(
  settingsStateSelector,
  (state) => state.updateMode ?? UpdateMode.PAGE,
);
