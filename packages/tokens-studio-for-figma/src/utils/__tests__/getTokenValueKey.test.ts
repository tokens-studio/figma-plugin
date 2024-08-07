import { getTokenValueKey } from '@/utils/getTokenValueKey';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

describe('getTokenValueKey', () => {
  const mockTokenFormat = TokenFormat as { tokenValueKey: string };

  const tokenValueKeys = [
    { tokenValueKey: '$value', ignoreTokenFormat: false, expected: '$value' },
    { tokenValueKey: '$value', ignoreTokenFormat: true, expected: 'value' },
    { tokenValueKey: 'value', ignoreTokenFormat: true, expected: 'value' },
    { tokenValueKey: 'value', ignoreTokenFormat: false, expected: 'value' },
  ];

  tokenValueKeys.forEach(({ tokenValueKey, ignoreTokenFormat, expected }) => {
    it(`should return "${expected}" when tokenValueKey is "${tokenValueKey}" and ignoreTokenFormat is ${ignoreTokenFormat}`, () => {
      mockTokenFormat.tokenValueKey = tokenValueKey;
      const result = getTokenValueKey(ignoreTokenFormat);
      expect(result).toBe(expected);
    });
  });
});
