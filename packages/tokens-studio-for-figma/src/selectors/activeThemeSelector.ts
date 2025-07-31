import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const activeThemeSelector = createSelector(
  tokenStateSelector,
  (state) => state.activeTheme,
);
