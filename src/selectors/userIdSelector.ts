import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const userIdSelector = createSelector(uiStateSelector, (state) => state.userId);
