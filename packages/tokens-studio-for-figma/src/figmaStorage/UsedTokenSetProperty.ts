import { UsedTokenSetsMap } from '@/types';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { tryParseJson } from '@/utils/tryParseJson';

export const UsedTokenSetProperty = new FigmaStorageProperty<string[] | UsedTokenSetsMap>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.usedTokenSet}`,
  (value) => JSON.stringify(value),
  (value) => tryParseJson(value) ?? {},
);
