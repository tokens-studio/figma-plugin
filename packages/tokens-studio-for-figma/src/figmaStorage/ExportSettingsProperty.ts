import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { ExportTokenSet } from '@/types/ExportTokenSet';

export interface ExportSettings {
  selectedThemes: string[];
  selectedSets: ExportTokenSet[];
  activeTab: 'useThemes' | 'useSets';
}

const defaultExportSettings: ExportSettings = {
  selectedThemes: [],
  selectedSets: [],
  activeTab: 'useSets',
};

export const ExportSettingsProperty = new FigmaStorageProperty<ExportSettings>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.exportSettings}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<ExportSettings>(() => (
    value ? JSON.parse(value) : defaultExportSettings
  ), defaultExportSettings),
);