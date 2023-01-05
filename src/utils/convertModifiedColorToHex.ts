import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';

export function convertModifiedColorToHex(baseColor: string, modifier: ColorModifier) {
  try {
    switch (modifier.type) {
      case ColorModifierTypes.LIGHTEN:
        return new Color(baseColor).lighten(Number(modifier.value)).toString({ inGamut: false, format: 'hex' });
      case ColorModifierTypes.DARKEN:
        return new Color(baseColor).darken(Number(modifier.value)).toString({ inGamut: false, format: 'hex' });
      case ColorModifierTypes.MIX:
        return new Color(new Color(baseColor).mix(new Color(modifier.color), Number(modifier.value), { outputSpace: 'sRGB' }).toString()).toString({ inGamut: false, format: 'hex' });
      case ColorModifierTypes.ALPHA: {
        const newColor = new Color(baseColor);
        newColor.alpha = Number(modifier.value);
        return newColor.toString({ inGamut: false, format: 'hex' });
      }
      default:
        return new Color(baseColor).toString({ inGamut: false, format: 'hex' });
    }
  } catch (e) {
    return baseColor;
  }
}
