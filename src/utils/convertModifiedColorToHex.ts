import Color from 'colorjs.io';
import { ColorModifier } from '@/types/Modifier';
import { modifyColor } from './modifyColor';

export function convertModifiedColorToHex(baseColor: string, modifier: ColorModifier) {
  let returnedColor = baseColor;
  try {
    returnedColor = modifyColor(baseColor, modifier);
    const returnedColorInSpace = new Color(returnedColor);
    return returnedColorInSpace.to('srgb').toString({ format: 'hex' });
  } catch (e) {
    return baseColor;
  }
}
