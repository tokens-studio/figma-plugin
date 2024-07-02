import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const figmaFontsSelector = createSelector(
  uiStateSelector,
  (state) => state.figmaFonts,
);
