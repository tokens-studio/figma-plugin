import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const inspectDeepSelector = createSelector(
  settingsStateSelector,
  (state) => state.inspectDeep,
);
