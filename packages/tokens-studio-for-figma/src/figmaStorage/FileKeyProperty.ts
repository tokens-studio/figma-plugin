import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';

export const FileKeyProperty = new FigmaStorageProperty(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.fileKey}`,
  (value) => value,
  (value) => value,
);
