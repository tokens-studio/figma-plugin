import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { ThemeObjectsList } from '@/types';

export const ThemesProperty = new FigmaStorageProperty<ThemeObjectsList>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.themes}`,
  (value) => compressToUTF16(JSON.stringify(value)),
  (value, isCompressed) => attemptOrFallback<ThemeObjectsList>(() => {
    if (!value) return [];
    if (!isCompressed) {
      const parsedValue = value ? JSON.parse(value) : [];
      return Array.isArray(parsedValue) ? parsedValue : [];
    }
    const decompressed = decompressFromUTF16(value);
    return JSON.parse(decompressed);
  }, []),
);
