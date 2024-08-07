import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

export function getTokenTypeKey(ignoreTokenFormat: boolean = false): string {
  const key = TokenFormat.tokenTypeKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}
