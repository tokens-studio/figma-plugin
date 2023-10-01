import Color from 'colorjs.io';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

export function mix(color: Color, colorSpace: ColorSpaceTypes, amount: number, mixColor: Color) {
  const mixValue = Math.max(0, Math.min(1, Number(amount)));

  return new Color(color.mix(mixColor, mixValue).toString());
}
