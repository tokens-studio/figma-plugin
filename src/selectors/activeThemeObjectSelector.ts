import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const activeThemeObjectSelector = createSelector(
  tokenStateSelector,
  (state) => state.themes.find(({ id }) => id === state.activeTheme) ?? null,
);
