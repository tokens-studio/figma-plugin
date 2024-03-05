import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const apiProvidersSelector = createSelector(
  uiStateSelector,
  (state) => state.apiProviders,
);
