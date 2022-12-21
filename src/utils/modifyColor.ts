import chroma from 'chroma-js';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';

export function modifyColor(baseColor: string, modifier: ColorModifier) {
  switch (modifier.type) {
    case ColorModifierTypes.LIGHTEN:
      return chroma(baseColor).brighten(Number(modifier.value));
    case ColorModifierTypes.DARKEN:
      return chroma(baseColor).darken(Number(modifier.value));
    case ColorModifierTypes.MIX:
      return chroma.mix(baseColor, modifier.color, Number(modifier.value));
    case ColorModifierTypes.ALPHA:
      return chroma(baseColor).alpha(Number(modifier.value));
    default:
      return baseColor;
  }
}
