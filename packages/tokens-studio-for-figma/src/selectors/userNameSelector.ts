import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const userNameSelector = createSelector(userStateSelector, (state) => state.userName);
