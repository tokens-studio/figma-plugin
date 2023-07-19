import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const ignoreTokenIdInJsonEditorSelector = createSelector(
  settingsStateSelector,
  (state) => state.ignoreTokenIdInJsonEditor,
);
