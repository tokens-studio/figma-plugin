import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const uiDisabledSelector = createSelector(
  uiStateSelector,
  (state) => state.disabled,
);
