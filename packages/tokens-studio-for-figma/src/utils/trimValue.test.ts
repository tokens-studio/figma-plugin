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

  it('preserves numeric array tuples like a cubicBezier value', () => {
    expect(trimValue([0.4, 0, 0.2, 1] as any)).toEqual([0.4, 0, 0.2, 1]);
  });

  it('trims string array elements without wrapping them in an object', () => {
    expect(trimValue([' 0.4 ', ' 0 '] as any)).toEqual(['0.4', '0']);
  });

  describe('gradient token handling', () => {
    it('should pass gradient object values through untouched', () => {
      const gradientValue = {
        kind: 'linear',
        angle: 180,
        start: { x: 0, y: 0.5 },
        end: { x: 1, y: 0.5 },
        stops: [
          { color: '#000000', position: 0, midpoint: 0.25 },
          { color: '{color.brand.500}', position: 1 },
        ],
      };
      expect(trimValue(gradientValue as any, TokenTypes.GRADIENT)).toEqual(gradientValue);
    });

    it('should trim gradient alias string values', () => {
      expect(trimValue(' {gradient.primary} ', TokenTypes.GRADIENT)).toBe('{gradient.primary}');
    });
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

  describe('fontWeights token handling', () => {
    it('should convert plain numeric font weight strings to numbers', () => {
      expect(trimValue('700', TokenTypes.FONT_WEIGHTS)).toBe(700);
      expect(trimValue(' 700 ', TokenTypes.FONT_WEIGHTS)).toBe(700);
      expect(trimValue('400', TokenTypes.FONT_WEIGHTS)).toBe(400);
    });

    it('should keep numeric font weight values as numbers', () => {
      expect(trimValue(700 as any, TokenTypes.FONT_WEIGHTS)).toBe(700);
      expect(trimValue(400 as any, TokenTypes.FONT_WEIGHTS)).toBe(400);
    });

    it('should keep alias font weights as strings', () => {
      expect(trimValue('{fontWeights.base}', TokenTypes.FONT_WEIGHTS)).toBe('{fontWeights.base}');
      expect(trimValue(' {fontWeights.base} ', TokenTypes.FONT_WEIGHTS)).toBe('{fontWeights.base}');
    });

    it('should keep named font weights as strings', () => {
      expect(trimValue('Bold', TokenTypes.FONT_WEIGHTS)).toBe('Bold');
      expect(trimValue(' bold ', TokenTypes.FONT_WEIGHTS)).toBe('bold');
    });

    it('should keep font weights with leading zeros as strings', () => {
      expect(trimValue('0700', TokenTypes.FONT_WEIGHTS)).toBe('0700');
      expect(trimValue(' 0700 ', TokenTypes.FONT_WEIGHTS)).toBe('0700');
    });
  });

  describe('font weight inside composite tokens', () => {
    it('should convert numeric fontWeight in a typography value to a number', () => {
      expect(trimValue({
        fontFamily: ' Inter',
        fontWeight: ' 700 ',
        fontSize: '18 ',
      } as any)).toEqual({
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: '18',
      });
    });

    it('should keep named fontWeight in a typography value as a string', () => {
      expect(trimValue({
        fontFamily: 'Inter',
        fontWeight: ' Bold ',
      } as any)).toEqual({
        fontFamily: 'Inter',
        fontWeight: 'Bold',
      });
    });

    it('should keep alias fontWeight in a typography value as a string', () => {
      expect(trimValue({
        fontFamily: 'Inter',
        fontWeight: '{fontWeights.base}',
      } as any)).toEqual({
        fontFamily: 'Inter',
        fontWeight: '{fontWeights.base}',
      });
    });
  });
});
