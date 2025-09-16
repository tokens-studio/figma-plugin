import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const renamedCollectionsSelector = createSelector(
  [tokenStateSelector],
  (tokenState) => tokenState.renamedCollections,
);
