import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertToFigmaColor } from '../../figmaTransforms/colors';

export function findMatchingNonLocalPaintStyle(styleId: string, colorToken: string) {
  let matchingStyle: PaintStyle | undefined;

  if (styleId) {
    const nonLocalStyle = figma.getStyleById(styleId);
    if (nonLocalStyle?.type === 'PAINT') {
      const stylePaint = (nonLocalStyle as PaintStyle).paints[0] ?? null;
      if (stylePaint?.type === 'SOLID') {
        const { color, opacity } = convertToFigmaColor(colorToken);
        const tokenPaint: SolidPaint = { color, opacity, type: 'SOLID' };
        if (isPaintEqual(stylePaint, tokenPaint)) {
          matchingStyle = nonLocalStyle as PaintStyle;
        }
      }
    }
  }

  return matchingStyle;
}
