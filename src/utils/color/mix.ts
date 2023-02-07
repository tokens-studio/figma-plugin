import Color from 'colorjs.io';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

export function mix(color: Color, colorSpace: ColorSpaceTypes, amount: number) {
  const mixValue = Math.max(1, Math.min(0, Number(amount)));

  return new Color(color.mix(color, mixValue).toString()).to(colorSpace);
}
