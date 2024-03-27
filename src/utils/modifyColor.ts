import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';
import { transparentize } from './color/transparentize';
import { mix } from './color/mix';
import { darken } from './color/darken';
import { lighten } from './color/lighten';
import { setLuminance } from './color/setLuminance';
// import { multiply } from './color/multiply';
// import { screen } from './color/screen';
// import { overlay } from './color/overlay';
// import { colorDodge } from './color/colorDodge';
// import { colorBurn } from './color/colorBurn';
// import { hardLight } from './color/hardLight';
// import { softLight } from './color/softLight';
// import { difference } from './color/difference';
// import { exclusion } from './color/exclusion';
// import { hue } from './color/hue';
// import { saturation } from './color/saturation';
// import { colorModifier } from './color/colorModifier';
// import { luminosity } from './color/luminosity';
import { add } from './color/add';
import { subtract } from './color/subtract';

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
      case ColorModifierTypes.LUMINANCE: {
        returnedColor = setLuminance(color, Number(modifier.value));
        break;
      }
      // case ColorModifierTypes.MULTIPLY: {
      //   returnedColor = multiply(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.SCREEN: {
      //   returnedColor = screen(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.OVERLAY: {
      //   returnedColor = overlay(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.COLOR_DODGE: {
      //   returnedColor = colorDodge(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.COLOR_BURN: {
      //   returnedColor = colorBurn(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.HARD_LIGHT: {
      //   returnedColor = hardLight(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.SOFT_LIGHT: {
      //   returnedColor = softLight(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.DIFFERENCE: {
      //   returnedColor = difference(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      // case ColorModifierTypes.EXCLUSION: {
      //   returnedColor = exclusion(color, modifier.space, Number(modifier.value));
      //   break;
      // }
      case ColorModifierTypes.ADD: {
        returnedColor = add(color, modifier.space, Number(modifier.value), new Color(modifier.color));
        break;
      }
      case ColorModifierTypes.SUBTRACT: {
        returnedColor = subtract(color, modifier.space, Number(modifier.value), new Color(modifier.color));
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
