import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';

export const changedTokensSelector = createSelector(
  tokenStateSelector,
  (state) => state.changedTokens,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
