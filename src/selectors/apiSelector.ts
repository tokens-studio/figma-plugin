import { createSelector } from 'reselect';
import { shallowEqual } from 'react-redux';
import { uiStateSelector } from './uiStateSelector';

export const apiSelector = createSelector(
  uiStateSelector,
  (state) => state.api,
  {
    memoizeOptions: {
      resultEqualityCheck: shallowEqual,
    },
  },
);
