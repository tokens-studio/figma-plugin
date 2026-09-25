import { isPaintEqual } from '@/utils/isPaintEqual';
import { gradientTokenToCss, isGradientTokenValue } from '@/utils/color/gradientTokenToCss';
import { TokenGradientValue } from '@/types/values';
import { convertStringToFigmaGradient } from '../../figmaTransforms/gradients';
import { convertToFigmaColor } from '../../figmaTransforms/colors';

// Helper function to check if a value is any type of gradient
const isGradient = (value: string): boolean => value?.startsWith?.('linear-gradient')
  || value?.startsWith?.('radial-gradient')
  || value?.startsWith?.('conic-gradient');

export function paintStyleMatchesColorToken(paintStyle: PaintStyle | undefined, colorToken: string | TokenGradientValue) {
  // Gradient-type tokens hold a structured value, flatten it to a CSS string
  const normalizedColorToken = isGradientTokenValue(colorToken) ? gradientTokenToCss(colorToken) : colorToken;
  const stylePaint = paintStyle?.paints[0] ?? null;
  if (stylePaint?.type === 'SOLID') {
    // A gradient value can never match a solid paint; skip the color conversion.
    if (isGradient(normalizedColorToken)) return false;
    const { color, opacity } = convertToFigmaColor(normalizedColorToken);
    const tokenPaint: SolidPaint = { color, opacity, type: 'SOLID' };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  if (
    (stylePaint?.type === 'GRADIENT_LINEAR'
      || stylePaint?.type === 'GRADIENT_RADIAL'
      || stylePaint?.type === 'GRADIENT_ANGULAR'
      || stylePaint?.type === 'GRADIENT_DIAMOND')
    && isGradient(normalizedColorToken)
  ) {
    const { gradientStops, gradientTransform, type } = convertStringToFigmaGradient(normalizedColorToken);
    if (type !== stylePaint.type) return false;
    const tokenPaint: GradientPaint = {
      type,
      gradientTransform,
      gradientStops,
    };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  return false;
}
