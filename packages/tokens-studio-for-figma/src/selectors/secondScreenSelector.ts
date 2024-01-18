import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const secondScreenSelector = createSelector(uiStateSelector, (state) => state.secondScreenEnabled);
