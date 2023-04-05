import Color from 'colorjs.io';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

export function darken(color: Color, colorSpace: ColorSpaceTypes, amount: number) {
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
      const newRed = Math.max(0, colorInP3.p3.r - amount * colorInP3.p3.r);
      const newGreen = Math.max(0, colorInP3.p3.g - amount * colorInP3.p3.g);
      const newBlue = Math.max(0, colorInP3.p3.b - amount * colorInP3.p3.b);
      colorInP3.set('p3.r', newRed);
      colorInP3.set('p3.g', newGreen);
      colorInP3.set('p3.b', newBlue);
      return colorInP3;
    }

    case ColorSpaceTypes.SRGB: {
      const newRed = Math.max(0, color.srgb.r - amount * color.srgb.r);
      const newGreen = Math.max(0, color.srgb.g - amount * color.srgb.g);
      const newBlue = Math.max(0, color.srgb.b - amount * color.srgb.b);
      color.set('srgb.r', newRed);
      color.set('srgb.g', newGreen);
      color.set('srgb.b', newBlue);
      return color;
    }

    default: {
      return color.darken(amount);
    }
  }
}
