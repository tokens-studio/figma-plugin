import { createSelector } from 'reselect';
import { shallowEqual } from 'react-redux';
import { tokenStateSelector } from './tokenStateSelector';

export const tokenGroupDescriptionSelector = createSelector(
  tokenStateSelector,
  (state) => state.tokenGroupDescription,
  {
    memoizeOptions: {
      resultEqualityCheck: shallowEqual,
    },
  },
);
