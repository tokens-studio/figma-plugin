import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const windowSizeSelector = createSelector(settingsStateSelector, (state) => state.uiWindow);
