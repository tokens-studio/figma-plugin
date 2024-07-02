import { convertFigmaColorToHex } from '@/plugin/figmaTransforms/colors';

export function isColorEqual(color1: RGBA, color2: RGBA) {
  // Comparison using rgba doesn't work as Figma has a rounding issue,
  // that doesn't produce same RGB floats as the existing color
  // See this issue: https://forum.figma.com/t/figmas-rgb-color-values-seems-to-have-a-rounding-error/23540

  // color1.r === color2.r
  // && color1.g === color2.g
  // && color1.b === color2.b
  // && color1.a === color2.a

  // Compare using hex instead for now:
  return convertFigmaColorToHex(color1) === convertFigmaColorToHex(color2);
}
