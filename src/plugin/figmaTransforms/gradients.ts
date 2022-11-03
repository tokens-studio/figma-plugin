import { figmaRGBToHex, extractLinearGradientParamsFromTransform } from '@figma-plugin/helpers';
import { Matrix, inverse } from 'ml-matrix';
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
  const degreesAsNumber = convertDegreeToNumber(gradientDegrees);
  const degrees = -(degreesAsNumber - 90);
  const rad = degrees * (Math.PI / 180);
  const scale = degreesAsNumber % 90 === 0 ? 1 : Math.sqrt(1 + Math.tan(degreesAsNumber * (Math.PI / 180)) ** 2);

  // start by transforming to the gradient center
  // which for figma is .5 .5 as it is a relative transform
  const transformationMatrix = new Matrix([
    [1, 0, 0.5],
    [0, 1, 0.5],
    [0, 0, 1],
  ]).mmul(
    // we can then multiply this with the rotation matrix
    new Matrix([
      [Math.cos(rad), Math.sin(rad), 0],
      [-Math.sin(rad), Math.cos(rad), 0],
      [0, 0, 1],
    ]),
  ).mmul(
    // next we need to multiply it with a scale matrix to fill the entire shape
    new Matrix([
      [scale, 0, 0],
      [0, scale, 0],
      [0, 0, 1],
    ]),
  ).mmul(
    // lastly we need to translate it back to the 0,0 origin
    // by negating the center transform
    new Matrix([
      [1, 0, -0.5],
      [0, 1, -0.5],
      [0, 0, 1],
    ]),
  );

  const gradientTransformMatrix = inverse(transformationMatrix).to2DArray();

  const gradientStops = colorStops.map((stop) => {
    const seperatedStop = stop.split(' ');
    const { color, opacity } = convertToFigmaColor(seperatedStop[0]);
    const gradientColor = color;
    gradientColor.a = opacity;
    return {
      color: gradientColor,
      position: parseFloat(seperatedStop[1]) / 100,
    };
  }) as ColorStop[];

  return {
    gradientStops,
    gradientTransform: [gradientTransformMatrix[0], gradientTransformMatrix[1]] as Transform,
  };
}
