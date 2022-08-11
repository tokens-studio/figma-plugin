import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const licenseDetailsSelector = createSelector(userStateSelector, (state) => state.licenseDetails);
