import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';

export const changedStateSelector = createSelector(
  tokenStateSelector,
  (state) => state.changedState,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
