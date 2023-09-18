import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const storeTokenIdInJsonEditorSelector = createSelector(
  settingsStateSelector,
  (state) => state.storeTokenIdInJsonEditor,
);
