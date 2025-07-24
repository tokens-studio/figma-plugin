import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const tokensSizeSelector = createSelector(
  tokenStateSelector,
  (state) => state.tokensSize,
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => a === b,
    },
  },
);
