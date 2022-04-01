import isEqual from 'lodash.isequal';
import { createSelector } from '@reduxjs/toolkit';
import { tokenStateSelector } from './tokenStateSelector';

export const importedTokensSelector = createSelector(
  tokenStateSelector,
  (state) => state.importedTokens,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
