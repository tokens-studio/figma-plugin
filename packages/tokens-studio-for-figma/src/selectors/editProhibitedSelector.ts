import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const editProhibitedSelector = createSelector(tokenStateSelector, (state) => state.editProhibited);
