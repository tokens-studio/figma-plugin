import { createSelector } from '@reduxjs/toolkit';
import { shallowEqual } from 'react-redux';
import { uiStateSelector } from './uiStateSelector';

export const confirmStateSelector = createSelector(
  uiStateSelector,
  (state) => state.confirmState,
  {
    memoizeOptions: {
      resultEqualityCheck: shallowEqual,
    },
  },
);
