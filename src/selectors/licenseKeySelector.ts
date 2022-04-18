import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const licenseKeySelector = createSelector(uiStateSelector, (state) => state.licenseKey);
