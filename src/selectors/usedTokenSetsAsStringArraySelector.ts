import { createSelector } from 'reselect';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokenStateSelector } from './tokenStateSelector';

// @README remove this after development
export const usedTokenSetsAsStringArraySelector = createSelector(
  tokenStateSelector,
  (state) => (
    Object.entries(state.usedTokenSet)
      .filter(([,status]) => status === TokenSetStatus.ENABLED)
      .map(([tokenSet]) => tokenSet)
  ),
);
