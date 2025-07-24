import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const showEditFormSelector = createSelector(
  uiStateSelector,
  (state) => state.showEditForm,
);
