import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const themePreferenceSelector = createSelector(
  [settingsStateSelector],
  (settings) => settings.themePreference,
);
