import { createSelector } from 'reselect';
import { shallowEqual } from 'react-redux';
import { uiStateSelector } from './uiStateSelector';

export const editTokenSelector = createSelector(
  uiStateSelector,
  (state) => state.editToken,
  {
    memoizeOptions: {
      resultEqualityCheck: shallowEqual,
    },
  },
);
