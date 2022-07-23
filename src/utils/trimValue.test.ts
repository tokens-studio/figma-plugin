import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
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
});
