import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';
import { transparentize } from './color/transparentize';
import { mix } from './color/mix';
import { darken } from './color/darken';
import { lighten } from './color/lighten';

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
        returnedColor = mix(color, modifier.space, Number(modifier.value), new Color(modifier.color));
        break;
      case ColorModifierTypes.ALPHA: {
        returnedColor = transparentize(color, Number(modifier.value));
        break;
      }
      default:
        returnedColor = color;
        break;
    }
    returnedColor = returnedColor.to(modifier.space);
    return returnedColor.toString({ inGamut: true, precision: 3 });
  } catch (e) {
    return baseColor;
  }
}
