import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';

export function modifyColor(baseColor: string, modifier: ColorModifier) {
  try {
    switch (modifier.type) {
      case ColorModifierTypes.LIGHTEN:
        return new Color(baseColor).lighten(Number(modifier.value)).toString();
      case ColorModifierTypes.DARKEN:
        return new Color(baseColor).darken(Number(modifier.value)).toString();
      case ColorModifierTypes.MIX:
        return new Color(baseColor).mix(new Color(modifier.color), Number(modifier.value), { outputSpace: 'sRGB' });
      case ColorModifierTypes.ALPHA:
        // eslint-disable-next-line no-case-declarations
        const newColor = new Color(baseColor);
        newColor.alpha = Number(modifier.value);
        return newColor.toString();
      default:
        return baseColor;
    }
  } catch (e) {
    return baseColor;
  }
}
