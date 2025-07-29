import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const lastSyncErrorSelector = createSelector(uiStateSelector, (state) => state.lastSyncError);
