import { SingleColorToken } from '@/types/tokens';
import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertStringToFigmaGradient } from './figmaTransforms/gradients';

export default function setColorValuesOnTarget(target: BaseNode | PaintStyle, token: Pick<SingleColorToken, 'value' | 'description'>, key: 'paints' | 'fills' | 'strokes' = 'paints') {
  try {
    const { description, value } = token;

    let existingPaint: Paint | null = null;
    if (key === 'paints' && 'paints' in target) {
      existingPaint = target.paints[0] ?? null;
    } else if (key === 'fills' && 'fills' in target && target.fills !== figma.mixed) {
      existingPaint = target.fills[0] ?? null;
    } else if (key === 'strokes' && 'strokes' in target) {
      existingPaint = target.strokes[0] ?? null;
    }

    if (value.startsWith('linear-gradient')) {
      const { gradientStops, gradientTransform } = convertStringToFigmaGradient(value);
      const newPaint: GradientPaint = {
        type: 'GRADIENT_LINEAR',
        gradientTransform,
        gradientStops,
      };

      if (!existingPaint || !isPaintEqual(newPaint, existingPaint)) {
        if (key === 'paints' && 'paints' in target) target.paints = [newPaint];
        if (key === 'fills' && 'fills' in target) target.fills = [newPaint];
        if (key === 'strokes' && 'strokes' in target) target.strokes = [newPaint];
      }
    } else {
      const { color, opacity } = convertToFigmaColor(value);
      const newPaint: SolidPaint = { color, opacity, type: 'SOLID' };
      if (!existingPaint || !isPaintEqual(newPaint, existingPaint)) {
        if (key === 'paints' && 'paints' in target) target.paints = [newPaint];
        if (key === 'fills' && 'fills' in target) target.fills = [newPaint];
        if (key === 'strokes' && 'strokes' in target) target.strokes = [newPaint];
      }
    }

    if (description && 'description' in target) {
      target.description = description;
    }
  } catch (e) {
    console.error('Error setting color', e);
  }
}
