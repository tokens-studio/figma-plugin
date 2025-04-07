import { AnyTokenList } from '@/types/tokens';
import { attemptOrFallback } from '@/utils/attemptOrFallback';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { trackFromPlugin } from '@/plugin/notifiers';

function getByteSize(str: string): number {
  let size = 0;
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    if (code <= 0x7f) size += 1;
    else if (code <= 0x7ff) size += 2;
    else if (code >= 0xd800 && code <= 0xdfff) {
      size += 4;
      i += 1;
    } else if (code <= 0xffff) size += 3;
    else size += 4;
  }
  return size;
}

export const ValuesProperty = new FigmaStorageProperty<Record<string, AnyTokenList>>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.values}`,
  (value) => JSON.stringify(value),
  (value) => {
    const result = attemptOrFallback<Record<string, AnyTokenList>>(() => (
      value ? JSON.parse(value) : {}
    ), {});

    setTimeout(() => {
      trackFromPlugin('sharedPluginData', {
        action: 'read',
        type: 'values',
        success: true,
        size: value ? Number((getByteSize(value) / 1024).toFixed(2)) : 0,
      });
    }, 10000);

    return result;
  },
);
