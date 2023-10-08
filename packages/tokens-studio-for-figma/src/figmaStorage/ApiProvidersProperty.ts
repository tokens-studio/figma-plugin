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
    if (Array.isArray(result)) return result;
    return Object.values(result).filter((value) => (
      typeof value === 'object'
    ));
  },
);
