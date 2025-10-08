import { getTokenValueKey } from './getTokenValueKey';
import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

describe('getTokenValueKey', () => {
  beforeEach(() => {
    // Reset to default legacy format
    TokenFormat.setFormat(TokenFormatOptions.Legacy);
  });

  it('should return the token value key from TokenFormat', () => {
    const key = getTokenValueKey();
    expect(key).toBe(TokenFormat.tokenValueKey);
  });

  it('should not strip $ prefix when ignoreTokenFormat is false', () => {
    TokenFormat.setFormat(TokenFormatOptions.DTCG);
    const key = getTokenValueKey(false);
    expect(key).toBe('$value');
  });

  it('should strip $ prefix when ignoreTokenFormat is true and key starts with $', () => {
    TokenFormat.setFormat(TokenFormatOptions.DTCG);
    const key = getTokenValueKey(true);
    expect(key).toBe('value');
  });

  it('should return key as-is when ignoreTokenFormat is true but key does not start with $', () => {
    TokenFormat.setFormat(TokenFormatOptions.Legacy);
    const key = getTokenValueKey(true);
    expect(key).toBe('value');
  });

  it('should handle different format values', () => {
    // Legacy format
    TokenFormat.setFormat(TokenFormatOptions.Legacy);
    expect(getTokenValueKey()).toBe('value');

    // DTCG format
    TokenFormat.setFormat(TokenFormatOptions.DTCG);
    expect(getTokenValueKey()).toBe('$value');
  });
});
