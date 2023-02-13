import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const themeObjectsSelector = createSelector(
  tokenStateSelector,
  (state) => state.themes,
);
