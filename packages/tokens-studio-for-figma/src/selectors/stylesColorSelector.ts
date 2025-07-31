import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const stylesColorSelector = createSelector(
  settingsStateSelector,
  (state) => state.stylesColor,
);
