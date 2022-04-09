import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const storageTypeSelector = createSelector(
  uiStateSelector,
  (state) => state.storageType,
);
