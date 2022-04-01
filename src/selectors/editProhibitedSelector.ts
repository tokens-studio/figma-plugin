import { createSelector } from '@reduxjs/toolkit';
import { tokenStateSelector } from './tokenStateSelector';

export const editProhibitedSelector = createSelector(tokenStateSelector, (state) => state.editProhibited);
