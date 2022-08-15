import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertToFigmaColor } from '../../figmaTransforms/colors';

export function paintStyleMatchesColorToken(paintStyle: PaintStyle | undefined, colorToken: string) {
  const stylePaint = paintStyle?.paints[0] ?? null;
  if (stylePaint?.type === 'SOLID') {
    const { color, opacity } = convertToFigmaColor(colorToken);
    const tokenPaint: SolidPaint = { color, opacity, type: 'SOLID' };
    return isPaintEqual(stylePaint, tokenPaint);
  }
  return false;
}
