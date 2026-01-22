import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { ExportTokenSet } from '@/types/ExportTokenSet';

export const SelectedExportSetsProperty = new FigmaStorageProperty<ExportTokenSet[]>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.selectedExportSets}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<ExportTokenSet[]>(() => (
    value ? JSON.parse(value) : []
  ), []),
);
