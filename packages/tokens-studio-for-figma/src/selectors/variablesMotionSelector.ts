import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const variablesMotionSelector = createSelector(
  settingsStateSelector,
  (state) => state.variablesMotion,
);
