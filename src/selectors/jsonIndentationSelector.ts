import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const jsonIndentationSelector = createSelector(
  settingsStateSelector,
  (state) => state.jsonIndentation,
);
