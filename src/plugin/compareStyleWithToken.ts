/* eslint-disable no-param-reassign */
import { TokenTypes } from '@/constants/TokenTypes';
import {
  SingleToken, SingleColorToken, AnyTokenList, SingleBoxShadowToken, SingleTypographyToken,
} from '@/types/tokens';
import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertStringToFigmaGradient } from './figmaTransforms/gradients';

export default function compareStyleValueWithTokenValue(style: PaintStyle | EffectStyle | TextStyle, token: SingleColorToken | SingleBoxShadowToken | SingleTypographyToken): boolean {
  if (style.type === 'PAINT' && token.type === TokenTypes.COLOR) {
    const { value } = token;
    const existingPaint = style.paints[0] ?? null;
    if (value.startsWith('linear-gradient')) {
      const { gradientStops, gradientTransform } = convertStringToFigmaGradient(value);
      const newPaint: GradientPaint = {
        type: 'GRADIENT_LINEAR',
        gradientTransform,
        gradientStops,
      };
      return isPaintEqual(newPaint, existingPaint);
    }
    const { color, opacity } = convertToFigmaColor(value);
    const newPaint: SolidPaint = { color, opacity, type: 'SOLID' };
    return isPaintEqual(newPaint, existingPaint);
  }
  return false;
}
