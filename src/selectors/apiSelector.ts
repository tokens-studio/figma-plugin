import { createSelector } from '@reduxjs/toolkit';
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
