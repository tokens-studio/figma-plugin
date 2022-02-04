import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertStringToFigmaGradient } from './figmaTransforms/gradients';

export default function setColorValuesOnTarget(target, token, key = 'paints') {
  try {
    const { description, value } = token;
    if (value.startsWith('linear-gradient')) {
      const { gradientStops, gradientTransform } = convertStringToFigmaGradient(value);
      const newPaint: GradientPaint = {
        type: 'GRADIENT_LINEAR',
        gradientTransform,
        gradientStops,
      };
      if (!isPaintEqual(newPaint, target[key][0])) {
        target[key] = [newPaint];
      }
    } else {
      const { color, opacity } = convertToFigmaColor(value);
      const newPaint: SolidPaint = { color, opacity, type: 'SOLID' };
      if (!isPaintEqual(newPaint, target[key][0])) {
        target[key] = [newPaint];
      }
    }

    if (description) {
      target.description = description;
    }
  } catch (e) {
    console.error('Error setting color', e);
  }
}
