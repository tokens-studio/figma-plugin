import Color from 'colorjs.io';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

export function lighten(color: Color, colorSpace: ColorSpaceTypes, amount: number) {
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
      const newRed = Math.min(1, colorInP3.p3.r + amount * (1 - colorInP3.p3.r));
      const newGreen = Math.min(1, colorInP3.p3.g + amount * (1 - colorInP3.p3.g));
      const newBlue = Math.min(1, colorInP3.p3.b + amount * (1 - colorInP3.p3.b));
      colorInP3.set('p3.r', newRed);
      colorInP3.set('p3.g', newGreen);
      colorInP3.set('p3.b', newBlue);
      return colorInP3;
    }
    case ColorSpaceTypes.SRGB: {
      const newRed = Math.min(1, color.srgb.r + amount * (1 - color.srgb.r));
      const newGreen = Math.min(1, color.srgb.g + amount * (1 - color.srgb.g));
      const newBlue = Math.min(1, color.srgb.b + amount * (1 - color.srgb.b));
      color.set('srgb.r', newRed);
      color.set('srgb.g', newGreen);
      color.set('srgb.b', newBlue);
      return color;
    }
    default: {
      return color.lighten(amount);
    }
  }
}
