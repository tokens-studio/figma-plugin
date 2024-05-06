import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const tokenSetMetadataSelector = createSelector(tokenStateSelector, (state) => state.tokenSetMetadata);
