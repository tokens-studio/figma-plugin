import { createSelector } from 'reselect';
import { userStateSelector } from './userStateSelector';

export const isFigmaEnterpriseSelector = createSelector(userStateSelector, (state) => state.isFigmaEnterprise);
