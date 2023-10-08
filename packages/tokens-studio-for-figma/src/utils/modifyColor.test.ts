import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';
import { ColorModifier } from '@/types/Modifier';
import { modifyColor } from './modifyColor';

describe('modifyColor', () => {
  it('should be able to lighten the color and convert color space', () => {
    const baseColor = '#ff0033';
    const lightenModifiers = {
      type: ColorModifierTypes.LIGHTEN,
      space: ColorSpaceTypes.LCH,
      value: '0.3',
    };
    const spaceValues = [
      {
        space: ColorSpaceTypes.LCH,
        output: 'lch(68.2 66.9 31.7)',
      },
      {
        space: ColorSpaceTypes.P3,
        output: 'color(display-p3 0.94 0.44 0.47)',
      },
      {
        space: ColorSpaceTypes.SRGB,
        output: 'rgb(100% 30% 44%)',
      },
    ];
    spaceValues.forEach((spaceValue) => {
      expect(modifyColor(baseColor, { ...lightenModifiers, space: spaceValue.space } as ColorModifier)).toEqual(spaceValue.output);
    });
  });

  it('should be able to darken the color and convert color space', () => {
    const baseColor = '#ff0033';
    const darkenModifiers = {
      type: ColorModifierTypes.DARKEN,
      space: ColorSpaceTypes.LCH,
      value: '0.3',
    };
    const spaceValues = [
      {
        space: ColorSpaceTypes.LCH,
        output: 'lch(38.2 66.9 31.7)',
      },
      {
        space: ColorSpaceTypes.P3,
        output: 'color(display-p3 0.64 0.14 0.17)',
      },
      {
        space: ColorSpaceTypes.SRGB,
        output: 'rgb(70% 0% 14%)',
      },
    ];
    spaceValues.forEach((spaceValue) => {
      expect(modifyColor(baseColor, { ...darkenModifiers, space: spaceValue.space } as ColorModifier)).toEqual(spaceValue.output);
    });
  });

  it('should be able to mix the color and convert color space', () => {
    const baseColor = '#ff0033';
    const mixModifiers = {
      type: ColorModifierTypes.MIX,
      space: ColorSpaceTypes.LCH,
      value: '0.3',
      color: '#334455',
    };
    const spaceValues = [
      {
        space: ColorSpaceTypes.LCH,
        output: 'lch(46.5 64.1 29.3)',
      },
      {
        space: ColorSpaceTypes.P3,
        output: 'color(display-p3 0.71 0.27 0.26)',
      },
      {
        space: ColorSpaceTypes.SRGB,
        output: 'rgb(77.2% 22.5% 24.3%)',
      },
    ];
    spaceValues.forEach((spaceValue) => {
      expect(modifyColor(baseColor, { ...mixModifiers, space: spaceValue.space } as ColorModifier)).toEqual(spaceValue.output);
    });
  });

  it('should be able to add the alpha to the color and convert color space', () => {
    const baseColor = '#ff0033';
    const alphaModifiers = {
      type: ColorModifierTypes.ALPHA,
      space: ColorSpaceTypes.LCH,
      value: '0.3',
    };
    const spaceValues = [
      {
        space: ColorSpaceTypes.LCH,
        output: 'lch(54.5 95.5 31.7 / 0.3)',
      },
      {
        space: ColorSpaceTypes.P3,
        output: 'color(display-p3 0.92 0.2 0.24 / 0.3)',
      },
      {
        space: ColorSpaceTypes.SRGB,
        output: 'rgb(100% 0% 20% / 0.3)',
      },
    ];
    spaceValues.forEach((spaceValue) => {
      expect(modifyColor(baseColor, { ...alphaModifiers, space: spaceValue.space } as ColorModifier)).toEqual(spaceValue.output);
    });
  });
});
