import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const showAutoSuggestSelector = createSelector(
  uiStateSelector,
  (state) => state.showAutoSuggest,
);
