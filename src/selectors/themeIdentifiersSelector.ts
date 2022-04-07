import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const themeIdentifiersSelector = createSelector(
  tokenStateSelector,
  (state) => Object.keys(state.themes),
);
