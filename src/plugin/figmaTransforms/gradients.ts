import { figmaRGBToHex } from '@figma-plugin/helpers';
import { getDegreesForMatrix, getMatrixForDegrees } from '@/utils/matrix';
import { convertToFigmaColor } from './colors';

export function convertDegreeToNumber(degreeString) {
  return degreeString.split('deg').join('');
}

export function convertFigmaGradientToString(paint: GradientPaint) {
  const { gradientTransform, gradientStops } = paint;
  const gradientStopsString = gradientStops
    .map((stop) => `${figmaRGBToHex(stop.color)} ${Math.round(stop.position * 100 * 100) / 100}%`)
    .join(', ');
  const gradientTransformString = getDegreesForMatrix(gradientTransform);
  return `linear-gradient(${gradientTransformString}, ${gradientStopsString})`;
}

export function convertStringToFigmaGradient(value: string) {
  const [gradientDegrees, ...colorStops] = value
    .substring(value.indexOf('(') + 1, value.lastIndexOf(')'))
    .split(', ');
  const degrees = convertDegreeToNumber(gradientDegrees);
  const gradientTransform = getMatrixForDegrees(degrees);

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

  return { gradientStops, gradientTransform };
}
