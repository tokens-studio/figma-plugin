import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const themeOptionsSelector = createSelector(
  tokenStateSelector,
  (state) => (
    Object.entries(state.themes).map(([id, theme]) => ({
      value: id,
      label: theme.name,
    }))
  ),
);
