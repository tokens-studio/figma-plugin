import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const usedEmailSelector = createSelector(userStateSelector, (state) => state.usedEmail);
