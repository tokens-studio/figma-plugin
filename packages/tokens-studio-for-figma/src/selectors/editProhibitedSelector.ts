import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const editProhibitedSelector = createSelector(
  tokenStateSelector,
  ({ editProhibited, activeTokenSet, tokenSetMetadata }) => editProhibited || tokenSetMetadata[activeTokenSet]?.isDynamic,
);
