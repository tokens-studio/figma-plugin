import { figmaRGBToHex, extractLinearGradientParamsFromTransform } from '@figma-plugin/helpers';
import { matrix, multiply, inv } from 'mathjs';
import { convertToFigmaColor } from './colors';

export function convertDegreeToNumber(degreeString: string): number {
  return parseFloat(degreeString.split('deg').join(''));
}

export function convertFigmaGradientToString(paint: GradientPaint) {
  const { gradientTransform, gradientStops } = paint;
  const gradientStopsString = gradientStops
    .map((stop) => `${figmaRGBToHex(stop.color)} ${Math.round(stop.position * 100 * 100) / 100}%`)
    .join(', ');
  const { start, end } = extractLinearGradientParamsFromTransform(1, 1, gradientTransform);
  const angleInRad = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const angleInDeg = Math.round((angleInRad * 180) / Math.PI);
  return `linear-gradient(${angleInDeg + 90}deg, ${gradientStopsString})`;
}

export function convertStringToFigmaGradient(value: string) {
  const [gradientDegrees, ...colorStops] = value
    .substring(value.indexOf('(') + 1, value.lastIndexOf(')'))
    .split(', ');
    // subtract 90 and negate it -- figma's roation goes anti-clockwise and 0deg
    // is left-right as opposed to bottom-top in css
  const degrees = -(convertDegreeToNumber(gradientDegrees) - 90);
  const rad = degrees * (Math.PI / 180);
  const gradientTransformMatrix = inv(
    // we need to inverse our final matrix because
    // figma's transformation matrices are inverted
    multiply(
      multiply(
        // start by transforming to the gradient center
        // which for figma is .5 .5 as it is a relative transform
        matrix([
          [1, 0, 0.5],
          [0, 1, 0.5],
          [0, 0, 1],
        ]),
        // we can then multiply this with the rotation matrix
        matrix([
          [Math.cos(rad), Math.sin(rad), 0],
          [-Math.sin(rad), Math.cos(rad), 0],
          [0, 0, 1],
        ]),
      ),
      // lastly we need to translate it back to the 0,0 origin
      // by negating the center transform
      matrix([
        [1, 0, -0.5],
        [0, 1, -0.5],
        [0, 0, 1],
      ]),
    ),
  ).toArray();
  console.log(gradientTransformMatrix);

  const gradientStops = colorStops.map((stop) => {
    const seperatedStop = stop.split(' ');
    const { color, opacity } = convertToFigmaColor(seperatedStop[0]);
    const gradientColor = color;
    gradientColor.a = opacity;
    return {
      color: gradientColor,
      position: parseFloat(seperatedStop[1]) / 100,
    };
  });

  return {
    gradientStops,
    gradientTransform: [gradientTransformMatrix[0], gradientTransformMatrix[1]],
  };
}
