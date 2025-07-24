import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';

export const SelectedExportThemesProperty = new FigmaStorageProperty<string[]>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.selectedExportThemes}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<string[]>(() => (
    value ? JSON.parse(value) : []
  ), []),
);
