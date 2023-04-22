import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export const CollapsedTokenSetsProperty = new FigmaStorageProperty<string[]>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.collapsedTokenSets}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<string[]>(() => {
    const parsedValue = value ? JSON.parse(value) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  }, []),
);
