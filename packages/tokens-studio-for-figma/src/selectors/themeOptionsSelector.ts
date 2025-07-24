import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const themeOptionsSelector = createSelector(
  tokenStateSelector,
  (state) => (
    Object.values(state.themes).map(({ id, name, group }) => ({
      value: id,
      label: name,
      group,
    }))
  ),
);
