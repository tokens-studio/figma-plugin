import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const createStylesWithVariableReferencesSelector = createSelector(
  settingsStateSelector,
  (state) => state.createStylesWithVariableReferences,
);
