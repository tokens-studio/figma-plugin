import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';

export const tokenSetsWithBrokenReferencesSelector = createSelector(
  tokenStateSelector,
  (state) => state.tokenSetsWithBrokenReferences,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
