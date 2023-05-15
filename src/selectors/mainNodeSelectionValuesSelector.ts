import { createSelector } from 'reselect';
import { shallowEqual } from 'react-redux';
import { uiStateSelector } from './uiStateSelector';
import { UIState } from '@/app/store/models/uiState';

export const mainNodeSelectionValuesSelector = createSelector(
  uiStateSelector,
  (state:UIState) => state.mainNodeSelectionValues,
  {
    memoizeOptions: {
      resultEqualityCheck: shallowEqual,
    },
  },
);
