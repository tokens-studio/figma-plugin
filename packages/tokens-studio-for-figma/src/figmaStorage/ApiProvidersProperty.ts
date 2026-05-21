import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials } from '@/types/StorageType';
import { tryParseJson } from '@/utils/tryParseJson';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const ApiProvidersProperty = new FigmaStorageProperty<StorageTypeCredentials[]>(
  FigmaStorageType.CLIENT_STORAGE,
  'apiProviders',
  (incoming) => JSON.stringify(incoming),
  (outgoing) => {
    type PossibleIncomingType = StorageTypeCredentials[] | Record<string, StorageTypeCredentials>;
    const result = tryParseJson<PossibleIncomingType>(outgoing) ?? [];
    const asArray = Array.isArray(result)
      ? result
      : Object.values(result).filter((value) => (
        typeof value === 'object'
      ));
    // Tokens Studio OAuth providers are derived live from the user's organizations
    // and must never be persisted. Strip any legacy entries that were saved by
    // older builds (e.g. when switching branches in an OAuth sync) so we don't
    // render duplicate rows in Sync Settings.
    return asArray.filter((value) => value?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH);
  },
);
