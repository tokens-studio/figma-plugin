import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';

export const VariableExportSettingsProperty = new FigmaStorageProperty<Record<string, boolean>>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.variableExportSettings}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<Record<string, boolean>>(() => (
    value ? JSON.parse(value) : {}
  ), {}),
);
