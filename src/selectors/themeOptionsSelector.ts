import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const themeOptionsSelector = createSelector(
  tokenStateSelector,
  (state) => (
    Object.values(state.themes).map(({ id, name }) => ({
      value: id,
      label: name,
    }))
  ),
);
