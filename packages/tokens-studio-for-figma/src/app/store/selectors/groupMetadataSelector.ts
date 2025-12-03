import { createSelector } from 'reselect';
import type { RootState } from '@/app/store';

export const tokenStateSelector = (state: RootState) => state.tokenState;

export const groupMetadataSelector = createSelector(
  tokenStateSelector,
  (state) => state.groupMetadata || {}
);

export const getGroupDescriptionSelector = (tokenSet: string, path: string) =>
  createSelector(
    groupMetadataSelector,
    (metadata) => metadata[tokenSet]?.[path]?.description
  );

export const getGroupMetadataByTokenSetSelector = (tokenSet: string) =>
  createSelector(
    groupMetadataSelector,
    (metadata) => metadata[tokenSet] || {}
  );