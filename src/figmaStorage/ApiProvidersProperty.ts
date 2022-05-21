import { StorageTypeCredentials } from '@/types/StorageType';
import { tryParseJson } from '@/utils/tryParseJson';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const ApiProvidersProperty = new FigmaStorageProperty<StorageTypeCredentials[]>(
  FigmaStorageType.CLIENT_STORAGE,
  'apiProviders',
  (incoming) => JSON.stringify(incoming),
  (outgoing) => tryParseJson<StorageTypeCredentials[]>(outgoing) ?? [],
);
