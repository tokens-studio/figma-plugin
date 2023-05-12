import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';
import { TokenState } from '@/app/store/models/tokenState';

export const tokensSelector = createSelector(
  tokenStateSelector,
  (state: TokenState) => state.tokens,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
