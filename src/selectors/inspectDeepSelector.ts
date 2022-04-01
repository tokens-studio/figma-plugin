import { createSelector } from '@reduxjs/toolkit';
import { settingsStateSelector } from './settingsStateSelector';

export const inspectDeepSelector = createSelector(
  settingsStateSelector,
  (state) => state.inspectDeep,
);
