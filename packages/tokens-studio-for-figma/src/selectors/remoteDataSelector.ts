import { createSelector } from 'reselect';
import { shallowEqual } from 'react-redux';
import { tokenStateSelector } from './tokenStateSelector';

export const remoteDataSelector = createSelector(
  tokenStateSelector,
  (state) => state.remoteData,
  {
    memoizeOptions: {
      resultEqualityCheck: shallowEqual,
    },
  },
);
