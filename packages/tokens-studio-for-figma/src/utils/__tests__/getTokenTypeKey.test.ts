import { getTokenTypeKey } from '@/utils/getTokenTypeKey';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

describe('getTokenTypeKey', () => {
  const mockTokenFormat = TokenFormat as { tokenTypeKey: string };

  const tokenTypeKeys = [
    { tokenTypeKey: '$type', ignoreTokenFormat: false, expected: '$type' },
    { tokenTypeKey: '$type', ignoreTokenFormat: true, expected: 'type' },
    { tokenTypeKey: 'type', ignoreTokenFormat: true, expected: 'type' },
    { tokenTypeKey: 'type', ignoreTokenFormat: false, expected: 'type' },
  ];

  tokenTypeKeys.forEach(({ tokenTypeKey, ignoreTokenFormat, expected }) => {
    it(`should return "${expected}" when tokenTypeKey is "${tokenTypeKey}" and ignoreTokenFormat is ${ignoreTokenFormat}`, () => {
      mockTokenFormat.tokenTypeKey = tokenTypeKey;
      const result = getTokenTypeKey(ignoreTokenFormat);
      expect(result).toBe(expected);
    });
  });
});
