import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const planSelector = createSelector(userStateSelector, (state) => state.licenseDetails.plan);
