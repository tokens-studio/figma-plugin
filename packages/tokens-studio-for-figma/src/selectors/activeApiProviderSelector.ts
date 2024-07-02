import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const activeApiProviderSelector = createSelector(uiStateSelector, (state) => state.api?.provider);
