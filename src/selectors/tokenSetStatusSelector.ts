import { createSelector } from 'reselect';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { usedTokenSetSelector } from './usedTokenSetSelector';
import type { RootState } from '@/app/store';

export const tokenSetStatusSelector = createSelector(
  usedTokenSetSelector,
  (state: RootState, tokenSet: string) => tokenSet,
  (usedTokenSets, tokenSet) => (
    usedTokenSets?.[tokenSet] ?? TokenSetStatus.DISABLED
  ),
);
