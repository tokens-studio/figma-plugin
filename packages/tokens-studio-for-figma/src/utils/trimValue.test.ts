import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import trimValue from './trimValue';

const regularValue = ['#ff00ff', ' #ff00ff', '#ff00ff ', ' #ff00ff '];
const typographyValue = {
  fontFamily: ' Inter',
  fontWeight: ' Regular ',
  lineHeight: ' AUTO ',
  fontSize: '18 ',
  letterSpacing: '0%',
  paragraphSpacing: '0',
  textDecoration: 'none',
  textCase: 'none',
};
const boxShadowValue = [
  {
    x: ' 16',
    y: ' 16',
    blur: '16 ',
    spread: ' 0 ',
    color: ' #000000 ',
    type: BoxShadowTypes.DROP_SHADOW,
  },
  {
    x: '16 ',
    y: '16 ',
    blur: '16',
    spread: '  0 ',
    color: '#000000   ',
    type: BoxShadowTypes.DROP_SHADOW,
  },
];

describe('trimValue', () => {
  it('return trimmed value when it is regular tokenValue', () => {
    regularValue.forEach((item) => {
      expect(trimValue(item)).toBe('#ff00ff');
    });
  });

  it('return trimmed value about all properties in typography tokenValue', () => {
    expect(trimValue(typographyValue)).toEqual({
      fontFamily: 'Inter',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '18',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    });
  });

  it('return trimmed value about all properties in boxShadow tokenValue', () => {
    expect(trimValue(boxShadowValue)).toEqual([
      {
        x: '16',
        y: '16',
        blur: '16',
        spread: '0',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      {
        x: '16',
        y: '16',
        blur: '16',
        spread: '0',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      },
    ]);
  });

  describe('number token handling', () => {
    it('should return number for number tokens with numeric string values', () => {
      expect(trimValue('42', TokenTypes.NUMBER)).toBe(42);
      expect(trimValue(' 16 ', TokenTypes.NUMBER)).toBe(16);
      expect(trimValue('0', TokenTypes.NUMBER)).toBe(0);
      expect(trimValue('-3.14', TokenTypes.NUMBER)).toBe(-3.14);
    });

    it('should return number for number tokens with numeric values', () => {
      expect(trimValue(42, TokenTypes.NUMBER)).toBe(42);
      expect(trimValue(0, TokenTypes.NUMBER)).toBe(0);
      expect(trimValue(-3.14, TokenTypes.NUMBER)).toBe(-3.14);
    });

    it('should return trimmed string for number tokens with non-numeric values', () => {
      expect(trimValue('16px', TokenTypes.NUMBER)).toBe('16px');
      expect(trimValue(' hello ', TokenTypes.NUMBER)).toBe('hello');
    });

    it('should handle non-number tokens normally', () => {
      expect(trimValue('42', TokenTypes.COLOR)).toBe('42');
      expect(trimValue(' hello ', TokenTypes.TEXT)).toBe('hello');
    });
  });
});
