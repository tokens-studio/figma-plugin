import { createSelector } from 'reselect';
import { storageTypeSelector } from './storageTypeSelector';
import { StorageProviderType } from '@/constants/StorageProviderType';

// Tokens Studio sync doesn't support extended collections yet, so features that
// create or export them are blocked while it's the active provider.
export const isTokensStudioSyncSelector = createSelector(
  storageTypeSelector,
  (storageType) => storageType?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH,
);
