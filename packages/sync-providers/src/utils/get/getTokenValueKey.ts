import { TokenFormat } from '../../classes/TokenFormatStoreClass';

export function getTokenValueKey(ignoreTokenFormat: boolean = false): string {
  const key = TokenFormat.tokenValueKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}