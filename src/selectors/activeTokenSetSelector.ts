import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';
import { TokenState } from '@/app/store/models/tokenState';

export const activeTokenSetSelector = createSelector(
  tokenStateSelector,
  (tokenState: TokenState): string => tokenState.activeTokenSet,
);
