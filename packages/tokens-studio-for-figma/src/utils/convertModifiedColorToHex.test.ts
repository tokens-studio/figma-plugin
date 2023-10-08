import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';
import { convertModifiedColorToHex } from './convertModifiedColorToHex';
import { ColorModifier } from '@/types/Modifier';

describe('convertModifiedColorToHex', () => {
  it('should be able to lighten the color', () => {
    const baseColor = '#ff0033';
    const lightenModifier = {
      type: ColorModifierTypes.LIGHTEN,
      space: ColorSpaceTypes.LCH,
      value: '0.3',
    } as ColorModifier;
    expect(convertModifiedColorToHex(baseColor, lightenModifier)).toEqual('#ff756b');
  });

  it('should be able to darken the color', () => {
    const baseColor = '#ff0033';
    const darkenModifier = {
      type: ColorModifierTypes.DARKEN,
      space: ColorSpaceTypes.LCH,
      value: '0.3',
    } as ColorModifier;
    expect(convertModifiedColorToHex(baseColor, darkenModifier)).toEqual('#ad1b26');
  });

  it('should be able to add alpha to the color', () => {
    const baseColor = '#ff0033';
    const alphaModifier = {
      type: ColorModifierTypes.ALPHA,
      space: ColorSpaceTypes.LCH,
      value: '0.3',
    } as ColorModifier;
    expect(convertModifiedColorToHex(baseColor, alphaModifier)).toEqual('#ff00334d');
  });

  it('should be able to mix the color', () => {
    const baseColor = '#ff0033';
    const lightenModifier = {
      type: ColorModifierTypes.MIX,
      space: ColorSpaceTypes.SRGB,
      value: '0.3',
      color: '#334455',
    } as ColorModifier;
    expect(convertModifiedColorToHex(baseColor, lightenModifier)).toEqual('#c5393e');
  });
});
