import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { isSingleBoxShadowToken } from '../isSingleBoxShadowToken';

describe('isSingleBoxShadowToken', () => {
  it('should validate correct values', () => {
    expect(isSingleBoxShadowToken({
      type: TokenTypes.BOX_SHADOW,
      value: 'alias-boxShadow',
    })).toBe(true);
    expect(isSingleBoxShadowToken({
      type: TokenTypes.BOX_SHADOW,
      value: {
        type: BoxShadowTypes.DROP_SHADOW,
        blur: 10,
        spread: 10,
        x: 0,
        y: 5,
        color: '#000000',
      },
    })).toBe(true);
  });

  it('should return false for incorrect values', () => {
    expect(isSingleBoxShadowToken(100)).toBe(false);
    expect(isSingleBoxShadowToken('value')).toBe(false);
    expect(isSingleBoxShadowToken({
      type: BoxShadowTypes.DROP_SHADOW,
      blur: 10,
      spread: 10,
      x: 0,
      y: 5,
      color: '#000000',
    })).toBe(false);
    expect(isSingleBoxShadowToken({
      type: TokenTypes.BOX_SHADOW,
      fontFamily: 'Roboto',
    })).toBe(false);
    expect(isSingleBoxShadowToken({
      type: TokenTypes.BOX_SHADOW,
      boxShadow: {
        type: BoxShadowTypes.DROP_SHADOW,
        blur: 10,
        spread: 10,
        x: 0,
        y: 5,
        color: '#000000',
      },
    })).toBe(false);
    expect(isSingleBoxShadowToken({
      type: TokenTypes.BOX_SHADOW,
      value: {
        value: '15px',
      },
    })).toBe(false);
  });
});
