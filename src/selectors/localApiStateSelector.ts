import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const localApiStateSelector = createSelector(
  uiStateSelector,
  (state) => state.localApiState,
);
