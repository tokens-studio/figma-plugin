import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';

export const ActiveThemeProperty = new FigmaStorageProperty<Record<string, string> | string>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.activeTheme}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<Record<string, string> | string>(() => (
    value ? JSON.parse(value) : {}
  ), value),
);
