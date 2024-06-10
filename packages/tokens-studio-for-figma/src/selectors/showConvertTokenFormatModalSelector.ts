import { createSelector } from 'reselect';
import { uiStateSelector } from './uiStateSelector';

export const showConvertTokenFormatModalSelector = createSelector(
  uiStateSelector,
  (state) => state.showConvertTokenFormatModal,
);
