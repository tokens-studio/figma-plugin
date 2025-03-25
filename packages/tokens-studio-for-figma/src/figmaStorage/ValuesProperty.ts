import { AnyTokenList } from '@/types/tokens';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { trackSharedPluginData } from '@/utils/analytics';

export const ValuesProperty = new FigmaStorageProperty<Record<string, AnyTokenList>>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.values}`,
  (value) => JSON.stringify(value),
  (value) => {
    try {
      const result = attemptOrFallback<Record<string, AnyTokenList>>(() => (
        value ? JSON.parse(value) : {}
      ), {});
      trackSharedPluginData({
        action: 'read',
        type: 'values',
        success: true,
        size: value ? new TextEncoder().encode(value).length : 0,
      });
      return result;
    } catch (error) {
      trackSharedPluginData({
        action: 'read',
        type: 'values',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        size: 0,
      });
      return {};
    }
  },
);
