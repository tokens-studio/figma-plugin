import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';

export const tokensSelector = createSelector(
  tokenStateSelector,
  (state) => state.tokens,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
