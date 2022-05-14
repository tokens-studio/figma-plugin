import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const licenseStatusSelector = createSelector(userStateSelector, (state) => state.licenseStatus);
