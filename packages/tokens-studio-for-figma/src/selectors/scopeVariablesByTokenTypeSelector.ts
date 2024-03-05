import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const scopeVariablesByTokenTypeSelector = createSelector(
  settingsStateSelector,
  (state) => state.scopeVariablesByTokenType,
);
