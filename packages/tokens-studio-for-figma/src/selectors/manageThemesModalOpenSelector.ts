import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const manageThemesModalOpenSelector = createSelector(
  uiStateSelector,
  (state) => state.manageThemesModalOpen,
);
