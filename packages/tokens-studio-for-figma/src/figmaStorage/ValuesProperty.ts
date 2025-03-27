import { AnyTokenList } from '@/types/tokens';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { trackFromPlugin } from '@/plugin/notifiers';

export const ValuesProperty = new FigmaStorageProperty<Record<string, AnyTokenList>>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.values}`,
  (value) => JSON.stringify(value),
  (value) => {
    const result = attemptOrFallback<Record<string, AnyTokenList>>(() => (
      value ? JSON.parse(value) : {}
    ), {});
    trackFromPlugin('sharedPluginData', {
      action: 'read',
      type: 'values',
      success: true,
      size: value ? new TextEncoder().encode(value).length : 0,
    });
    return result;
  },
);
