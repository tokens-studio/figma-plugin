import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const entitlementsSelector = createSelector(userStateSelector, (state) => state.licenseDetails.entitlements);
