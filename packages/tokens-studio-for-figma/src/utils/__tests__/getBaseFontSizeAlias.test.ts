import { getBaseFontSizeAlias } from '../getBaseFontSizeAlias';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

describe('getBaseFontSizeAlias', () => {
  const systemToken = { name: '@system.baseFontSize', value: '14px', type: TokenTypes.DIMENSION } as SingleToken;

  it('keeps the configured alias', () => {
    expect(getBaseFontSizeAlias('{typography.base}', [systemToken])).toBe('{typography.base}');
    expect(getBaseFontSizeAlias('16', [systemToken])).toBe('16');
  });

  it('falls back to the @system.baseFontSize token when the setting is empty', () => {
    expect(getBaseFontSizeAlias('', [systemToken])).toBe('{@system.baseFontSize}');
    expect(getBaseFontSizeAlias(undefined, [systemToken])).toBe('{@system.baseFontSize}');
  });

  it('returns an empty alias when the setting is empty and there is no system token', () => {
    expect(getBaseFontSizeAlias('', [])).toBe('');
    expect(getBaseFontSizeAlias(null, [])).toBe('');
  });
});
