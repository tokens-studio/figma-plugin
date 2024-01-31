import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const licenseKeyErrorSelector = createSelector(userStateSelector, (state) => state.licenseError);
