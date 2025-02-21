import { createSelector } from 'reselect';
import { isEqual } from '@/utils/isEqual';
import { tokenStateSelector } from './tokenStateSelector';

export const importedThemesSelector = createSelector(
  tokenStateSelector,
  (state) => state.importedThemes,
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  },
);
