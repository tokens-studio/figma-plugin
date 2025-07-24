import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';

export const importedTokensSelector = createSelector(
  tokenStateSelector,
  (state) => state.importedTokens,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
