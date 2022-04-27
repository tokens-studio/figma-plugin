import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const userIdSelector = createSelector(userStateSelector, (state) => state.userId);
