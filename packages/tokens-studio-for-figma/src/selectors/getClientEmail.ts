import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const clientEmailSelector = createSelector(userStateSelector, (state) => state.licenseDetails.clientEmail);
