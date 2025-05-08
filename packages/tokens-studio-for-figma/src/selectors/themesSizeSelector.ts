import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const themesSizeSelector = createSelector(
  tokenStateSelector,
  (state) => state.themesSize,
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => a === b,
    },
  },
);
