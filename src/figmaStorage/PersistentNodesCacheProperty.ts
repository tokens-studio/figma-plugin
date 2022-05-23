import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { tryParseJson } from '@/utils/tryParseJson';
import { NodemanagerCacheNode } from '@/plugin/NodeManager';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export const PersistentNodesCacheProperty = new FigmaStorageProperty<[string, NodemanagerCacheNode][]>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.persistentNodesCache}`,
  (value) => JSON.stringify(value),
  (value) => tryParseJson<[string, NodemanagerCacheNode][]>(value),
);
