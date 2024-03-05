import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const languageSelector = createSelector(
  settingsStateSelector,
  (state) => state.language,
);
