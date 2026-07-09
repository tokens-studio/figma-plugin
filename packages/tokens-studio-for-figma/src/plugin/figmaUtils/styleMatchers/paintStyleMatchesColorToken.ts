import { isPaintEqual } from '@/utils/isPaintEqual';
import { gradientTokenToCss, isGradientTokenValue } from '@/utils/color/gradientTokenToCss';
import { convertStringToFigmaGradient } from '../../figmaTransforms/gradients';
import { convertToFigmaColor } from '../../figmaTransforms/colors';

// Helper function to check if a value is any type of gradient
const isGradient = (value: string): boolean => value?.startsWith?.('linear-gradient')
  || value?.startsWith?.('radial-gradient')
  || value?.startsWith?.('conic-gradient');

export function paintStyleMatchesColorToken(paintStyle: PaintStyle | undefined, colorToken: string) {
  // Gradient-type tokens hold a structured value, flatten it to a CSS string
  const normalizedColorToken = isGradientTokenValue(colorToken) ? gradientTokenToCss(colorToken) : colorToken;
  const stylePaint = paintStyle?.paints[0] ?? null;
  if (stylePaint?.type === 'SOLID') {
    const { color, opacity } = convertToFigmaColor(normalizedColorToken);
    const tokenPaint: SolidPaint = { color, opacity, type: 'SOLID' };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  if (stylePaint?.type === 'GRADIENT_LINEAR' && isGradient(normalizedColorToken)) {
    const { gradientStops, gradientTransform } = convertStringToFigmaGradient(normalizedColorToken);
    const tokenPaint: GradientPaint = {
      type: 'GRADIENT_LINEAR',
      gradientTransform,
      gradientStops,
    };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  if (stylePaint?.type === 'GRADIENT_RADIAL' && isGradient(normalizedColorToken)) {
    const { gradientStops, gradientTransform } = convertStringToFigmaGradient(normalizedColorToken);
    const tokenPaint: GradientPaint = {
      type: 'GRADIENT_RADIAL',
      gradientTransform,
      gradientStops,
    };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  return false;
}
