import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const licenseKeySelector = createSelector(userStateSelector, (state) => state.licenseKey);
