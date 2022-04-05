import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const tokenFilterSelector = createSelector(
  uiStateSelector,
  (state) => state.tokenFilter,
);
