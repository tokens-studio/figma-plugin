import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { AnyTokenList } from '@/types/tokens';

export const ValuesProperty = new FigmaStorageProperty<Record<string, AnyTokenList>>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.values}`,
  (value) => compressToUTF16(JSON.stringify(value)),
  (value, isCompressed) => attemptOrFallback<Record<string, AnyTokenList>>(() => {
    if (!value) return {};
    if (!isCompressed) return JSON.parse(value);
    const decompressed = decompressFromUTF16(value);
    return JSON.parse(decompressed);
  }, {}),
);
