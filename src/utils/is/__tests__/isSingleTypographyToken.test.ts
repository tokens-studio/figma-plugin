import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { isSingleTypographyToken } from '../isSingleTypographyToken';

describe('isSingleTypographyToken', () => {
  it('should validate correct values', () => {
    expect(isSingleTypographyToken({
      type: TokenTypes.TYPOGRAPHY,
      value: 'alias-typography',
    })).toBe(true);
    expect(isSingleTypographyToken({
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Roboto',
      },
    })).toBe(true);
  });

  it('should return false for incorrect values', () => {
    expect(isSingleTypographyToken(100)).toBe(false);
    expect(isSingleTypographyToken('value')).toBe(false);
    expect(isSingleTypographyToken({
      type: BoxShadowTypes.DROP_SHADOW,
      blur: 10,
      spread: 10,
      x: 0,
      y: 5,
      color: '#000000',
    })).toBe(false);
    expect(isSingleTypographyToken({
      type: TokenTypes.TYPOGRAPHY,
      fontFamily: 'Roboto',
    })).toBe(false);
    expect(isSingleTypographyToken({
      type: TokenTypes.TYPOGRAPHY,
      font: {
        fontFamily: 'Roboto',
      },
    })).toBe(false);
    expect(isSingleTypographyToken({
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Roboto',
        value: '15px',
      },
    })).toBe(false);
  });
});
