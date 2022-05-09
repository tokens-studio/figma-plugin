import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const checkedLocalStorageForKeySelector = createSelector(
  userStateSelector,
  (state) => state.checkedLocalStorageForKey,
);
