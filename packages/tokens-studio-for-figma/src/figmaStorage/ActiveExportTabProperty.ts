import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export const ActiveExportTabProperty = new FigmaStorageProperty<'useThemes' | 'useSets' | null>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.activeExportTab}`,
  (value) => value || '',
  (value) => (value === 'useThemes' || value === 'useSets' ? value : null),
);
