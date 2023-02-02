import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

function lightenL(l: number, amount: number) {
  console.log('lightenL', l, amount, l * (1 + amount));

  // do not go above 1
  if (l * (1 + amount) > 100) {
    return 100;
  }

  console.log('lightenL', l, amount, l * (1 + amount));

  return l * (1 + amount);
}

// write the same function for darken
function darkenL(l: number, amount: number) {
  console.log('darkenL', l, amount, l * (1 - amount));

  // do not go below 0
  if (l * (1 - amount) < 0) {
    return 0;
  }

  return l * (1 - amount);
}

export function lighten(color: Color, colorSpace: ColorSpaceTypes, amount: number) {
  // return new Color(color.mix('white', amount, { outputSpace: 'sRGB' }).toString());
  console.log('lighten', color, colorSpace, amount);

  const space = colorSpace;
  console.log('space', space);

  return color.set('lch.l', (l) => lightenL(l, amount));
}

export function darken(color: Color, colorSpace: ColorSpaceTypes, amount: number) {
  // return new Color(color.mix(new Color('black'), amount, { outputSpace: 'sRGB' }).toString());
  console.log('darken', color, colorSpace, amount);

  return color.set('lch.l', (l) => darkenL(l, amount));
}

export function modifyColor(baseColor: string, modifier: ColorModifier) {
  const color = new Color(baseColor);
  console.log('Base color', color, baseColor, modifier);
  let returnedColor = color;
  try {
    switch (modifier.type) {
      case ColorModifierTypes.LIGHTEN:
        returnedColor = lighten(color, modifier.space, Number(modifier.value));
        console.log('Returned color', returnedColor.hsl);

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
        returnedColor = newColor.to(modifier.space);
        break;
      default:
        returnedColor = color;
        break;
    }
    console.log('returned color', returnedColor);
    console.log('returned color to string', returnedColor.toString({ inGamut: false, precision: 3 }));

    return returnedColor.toString({ inGamut: false, precision: 3 });
  } catch (e) {
    return baseColor;
  }
}
