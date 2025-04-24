import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';

export const ThemesProperty = new FigmaStorageProperty<string>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.themes}`,
  (value) => (typeof value === 'string' ? value : JSON.stringify(value)),
  (value) => attemptOrFallback<string>(() => {
    if (!value) return '[]';
    return typeof value === 'string' ? value : '[]';
  }, '[]'),
);
