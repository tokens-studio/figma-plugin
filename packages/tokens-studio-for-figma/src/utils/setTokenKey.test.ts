import {
  setTokenKey, FormatSensitiveTokenKeys, SingleTokenWithoutName,
} from '@/utils/setTokenKey';
import { TokenFormatOptions, TokenFormat } from '@/plugin/TokenFormatStoreClass';

describe('setTokenKey', () => {
  const KEY_VALUES = Object.values(FormatSensitiveTokenKeys);
  const LEGACY_TOKEN_FORMAT = { value: '#FFFFFF', type: 'color' } as SingleTokenWithoutName;
  const DTCG_TOKEN_FORMAT = { $value: '#FFFFFF', $type: 'color' } as unknown as SingleTokenWithoutName;

  describe('when the format is set to legacy', () => {
    it('should update the keys given the token is DTCG', () => {
      TokenFormat.setFormat(TokenFormatOptions.Legacy);

      const input = { ...DTCG_TOKEN_FORMAT };
      KEY_VALUES.forEach((v) => setTokenKey(input, v));

      expect(input).toEqual(LEGACY_TOKEN_FORMAT);
    });

    it('should not update the keys when the input token is DTCG and it does not have the given key', () => {
      TokenFormat.setFormat(TokenFormatOptions.Legacy);

      const input = { ...LEGACY_TOKEN_FORMAT };
      const originalInput = { ...input };
      setTokenKey(input, FormatSensitiveTokenKeys.DESCRIPTION);

      expect(input).toEqual(originalInput);
    });
  });

  describe('when the format is set to DTCG', () => {
    it('should update the keys given the token is legacy', () => {
      TokenFormat.setFormat(TokenFormatOptions.DTCG);

      const input = { ...LEGACY_TOKEN_FORMAT };
      KEY_VALUES.forEach((v) => setTokenKey(input, v));

      expect(input).toEqual(DTCG_TOKEN_FORMAT);
    });

    it('should not update the keys if the given legacy token does not have the key', () => {
      TokenFormat.setFormat(TokenFormatOptions.DTCG);

      const input = { ...DTCG_TOKEN_FORMAT };
      const originalInput = { ...input };
      setTokenKey(input, FormatSensitiveTokenKeys.DESCRIPTION);

      expect(input).toEqual(originalInput);
    });
  });
});
