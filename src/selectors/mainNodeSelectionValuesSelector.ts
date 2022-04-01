import { createSelector } from '@reduxjs/toolkit';
import { shallowEqual } from 'react-redux';
import { uiStateSelector } from './uiStateSelector';

export const mainNodeSelectionValuesSelector = createSelector(
  uiStateSelector,
  (state) => state.mainNodeSelectionValues,
  {
    memoizeOptions: {
      resultEqualityCheck: shallowEqual,
    },
  },
);
