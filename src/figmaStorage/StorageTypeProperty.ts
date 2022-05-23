import omit from 'just-omit';
import { StorageType } from '@/types/StorageType';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { tryParseJson } from '@/utils/tryParseJson';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export const StorageTypeProperty = new FigmaStorageProperty<StorageType>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.storageType}`,
  (value) => JSON.stringify(omit(value, 'secret')),
  (value) => tryParseJson<StorageType>(value),
);
