import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const tokenTypeSelector = createSelector(
  settingsStateSelector,
  (state) => state.tokenType,
);
