import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';
import { darken, lighten } from './modifyColor';

export function convertModifiedColorToHex(baseColor: string, modifier: ColorModifier) {
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
        returnedColor = new Color(color.mix(new Color(modifier.color), Number(modifier.value), { outputSpace: 'sRGB' }).toString());
        break;
      case ColorModifierTypes.ALPHA: {
        const newColor = color;
        newColor.alpha = Number(modifier.value);
        returnedColor = newColor;
        break;
      }
      default:
        returnedColor = color;
        break;
    }
    console.log('convertModifiedColorToHex', returnedColor, returnedColor.toString({ inGamut: false, format: 'hex' }));

    return returnedColor.toString({ inGamut: false, format: 'hex' });
  } catch (e) {
    return baseColor;
  }
}
