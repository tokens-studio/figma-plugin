import Color from 'colorjs.io';

export function setLuminance(color: Color, amount: number) {
  color.set('lch.l', amount);
  return color;
}
