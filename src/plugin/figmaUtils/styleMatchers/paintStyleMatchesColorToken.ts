import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertStringToFigmaGradient } from '../../figmaTransforms/gradients';
import { convertToFigmaColor } from '../../figmaTransforms/colors';

export function paintStyleMatchesColorToken(paintStyle: PaintStyle | undefined, colorToken: string) {
  const stylePaint = paintStyle?.paints[0] ?? null;
  if (stylePaint?.type === 'SOLID') {
    const { color, opacity } = convertToFigmaColor(colorToken);
    const tokenPaint: SolidPaint = { color, opacity, type: 'SOLID' };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  if (stylePaint?.type === 'GRADIENT_LINEAR') {
    const { gradientStops, gradientTransform } = convertStringToFigmaGradient(colorToken);
    const tokenPaint: GradientPaint = {
      type: 'GRADIENT_LINEAR',
      gradientTransform,
      gradientStops,
    };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  return false;
}
