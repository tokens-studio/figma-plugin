import { ThemeObjectsList } from '@/types';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export const ThemesProperty = new FigmaStorageProperty<ThemeObjectsList>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.themes}`,
  (value) => JSON.stringify(value),
  (value) => attemptOrFallback<ThemeObjectsList>(() => {
    const parsedValue = value ? JSON.parse(value) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  }, []),
);
