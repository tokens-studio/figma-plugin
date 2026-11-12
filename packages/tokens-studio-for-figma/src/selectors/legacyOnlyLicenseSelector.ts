import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const legacyOnlyLicenseSelector = createSelector(userStateSelector, (state) => state.legacyOnlyLicense);
