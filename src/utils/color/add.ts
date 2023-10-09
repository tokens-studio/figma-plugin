import Color from 'colorjs.io';

export function add(color: Color, space: string, amount: number, targetColor: Color) {
  const newCoords = color.coords.map((coord, i) => coord + (targetColor.coords[i] * amount)) as [number, number, number];
  const newColor = new Color(space, newCoords);
  return newColor;
}
