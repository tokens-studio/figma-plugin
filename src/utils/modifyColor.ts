import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

export function lighten(color: Color, colorSpace: ColorSpaceTypes, amount: number) {
  // return new Color(color.mix('white', amount, { outputSpace: 'sRGB' }).toString());
  console.log('Trying to lighten in', colorSpace, amount, color);
  switch (colorSpace) {
    case ColorSpaceTypes.LCH: {
      const lightness = color.lch.l;
      const difference = 100 - lightness;
      const newChroma = Math.max(0, color.lch.c - amount * color.lch.c);
      const newLightness = Math.min(100, lightness + difference * amount);
      color.set('lch.l', newLightness);
      color.set('lch.c', newChroma);
      return color;
    }
    case ColorSpaceTypes.HSL: {
      const lightness = color.hsl.l;
      const difference = 100 - lightness;
      const newLightness = Math.min(100, lightness + difference * amount);
      color.set('hsl.l', newLightness);
      return color;
    }
    case ColorSpaceTypes.P3: {
      const colorInP3 = color.to('p3');
      const lightness = colorInP3.p3[0];
      console.log('lightness is', lightness);

      const difference = 1 - lightness;
      console.log('difference is', difference);

      const newLightness = Math.min(1, lightness + difference * amount);
      console.log('newLightness is', newLightness);

      colorInP3.p3[0] = newLightness;
      return colorInP3;
    }
    default: {
      return color.lighten(amount);
    }
  }
}

export function darken(color: Color, colorSpace: ColorSpaceTypes, amount: number) {
  // write the same function as above, but for darken
  switch (colorSpace) {
    case ColorSpaceTypes.LCH: {
      const lightness = color.lch.l;
      const difference = lightness;
      const newChroma = Math.max(0, color.lch.c - amount * color.lch.c);
      const newLightness = Math.max(0, lightness - difference * amount);
      color.set('lch.l', newLightness);
      color.set('lch.c', newChroma);
      return color;
    }
    case ColorSpaceTypes.HSL: {
      const lightness = color.hsl.l;
      const difference = lightness;
      const newLightness = Math.max(0, lightness - difference * amount);
      color.set('hsl.l', newLightness);
      return color;
    }
    case ColorSpaceTypes.P3: {
      const colorInP3 = color.to('p3');
      const lightness = colorInP3.p3[0];
      const difference = lightness;
      const newLightness = Math.max(0, lightness - difference * amount);
      colorInP3.p3[0] = newLightness;
      return colorInP3;
    }

    default: {
      return color.darken(amount);
    }
  }
}

export function modifyColor(baseColor: string, modifier: ColorModifier) {
  const color = new Color(baseColor);
  let returnedColor = color;
  try {
    switch (modifier.type) {
      case ColorModifierTypes.LIGHTEN:
        returnedColor = lighten(color, modifier.space, Number(modifier.value));

        break;
      case ColorModifierTypes.DARKEN:
        returnedColor = darken(color, modifier.space, Number(modifier.value));

        break;
      case ColorModifierTypes.MIX:
        returnedColor = new Color(color.mix(modifier.color, Number(modifier.value)).toString()).to(modifier.space);
        break;
      case ColorModifierTypes.ALPHA:
        // eslint-disable-next-line no-case-declarations
        const newColor = color;
        newColor.alpha = Number(modifier.value);
        break;
      default:
        returnedColor = color;
        break;
    }
    returnedColor = returnedColor.to(modifier.space);

    return returnedColor.toString({ inGamut: true, precision: 5 });
  } catch (e) {
    return baseColor;
  }
}
