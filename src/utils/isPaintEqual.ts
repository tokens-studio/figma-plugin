import { convertFigmaPaintToHex, convertFigmaColorToHex } from '@/plugin/figmaTransforms/colors';

export function isPaintEqual(paint1?: Paint, paint2?: Paint) {
  if (paint1 && paint2) {
    if (paint1.type === paint2.type) {
      if (paint1.type === 'SOLID' && paint2.type === 'SOLID') {
        return (
          paint1.opacity === paint2.opacity
          // Comparison using rgb doesn't work as Figma has a rounding issue,
          // that doesn't produce same RGB floats as the existing color
          // See this issue: https://forum.figma.com/t/figmas-rgb-color-values-seems-to-have-a-rounding-error/23540

          // && paint1.color.r === paint2.color.r
          // && paint1.color.g === paint2.color.g
          // && paint1.color.b === paint2.color.b

          // Compare using hex instead for now:
          && convertFigmaPaintToHex(paint1) === convertFigmaPaintToHex(paint2)
        );
      }

      if (paint1.type === 'GRADIENT_LINEAR' && paint2.type === 'GRADIENT_LINEAR') {
        return (
          paint1.gradientStops.length === paint2.gradientStops.length
          && paint1.gradientStops.every((stop, index) => (
            stop.position === paint2.gradientStops[index].position
            // Comparison using rgba doesn't work as Figma has a rounding issue,
            // that doesn't produce same RGB floats as the existing color
            // See this issue: https://forum.figma.com/t/figmas-rgb-color-values-seems-to-have-a-rounding-error/23540

            // && stop.color.r === paint2.gradientStops[index].color.r
            // && stop.color.g === paint2.gradientStops[index].color.g
            // && stop.color.b === paint2.gradientStops[index].color.b
            // && stop.color.a === paint2.gradientStops[index].color.a

              // Compare using hex instead for now:
              && convertFigmaColorToHex(stop.color) === convertFigmaColorToHex(paint2.gradientStops[index].color)
          ))
          && paint1.gradientTransform[0].every((value, index) => (
            value === paint2.gradientTransform[0][index]
          ))
          && paint1.gradientTransform[1].every((value, index) => (
            value === paint2.gradientTransform[1][index]
          ))
        );
      }
    }
    return false;
  }
  return paint1 === paint2;
}
