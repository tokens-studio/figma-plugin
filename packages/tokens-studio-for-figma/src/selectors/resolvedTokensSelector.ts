import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';

export const resolvedTokensSelector = createSelector(
  tokenStateSelector,
  (state) => state.resolvedTokens,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
