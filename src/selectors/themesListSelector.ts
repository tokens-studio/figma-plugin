import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const themesListSelector = createSelector(
  tokenStateSelector,
  (state) => state.themes,
);
