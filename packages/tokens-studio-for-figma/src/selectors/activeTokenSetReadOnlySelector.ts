import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const activeTokenSetReadOnlySelector = createSelector(
  tokenStateSelector,
  ({ activeTokenSet, tokenSetMetadata }) => tokenSetMetadata[activeTokenSet]?.isDynamic,
);
