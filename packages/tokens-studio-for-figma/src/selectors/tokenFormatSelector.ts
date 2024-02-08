import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const tokenFormatSelector = createSelector(
  tokenStateSelector,
  (state) => state.tokenFormat,
);
