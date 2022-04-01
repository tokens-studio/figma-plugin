import { createSelector } from '@reduxjs/toolkit';
import { uiStateSelector } from './uiStateSelector';

export const apiProvidersSelector = createSelector(
  uiStateSelector,
  (state) => state.apiProviders,
);
