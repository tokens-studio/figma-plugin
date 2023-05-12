import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';
import { TokenState } from '@/app/store/models/tokenState';

export const usedTokenSetSelector = createSelector(
  tokenStateSelector,
  (state:TokenState) => state.usedTokenSet,
);
