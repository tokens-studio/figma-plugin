import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenColorValue } from '@/types/values';
import {
  effectStyleMatchesBoxShadowToken,
  paintStyleMatchesColorToken,
  textStyleMatchesTypographyToken,
} from './figmaUtils/styleMatchers';

export default function compareStyleValueWithTokenValue(
  style: PaintStyle | EffectStyle | TextStyle,
  token: SingleToken<true, { path: string }>,
  baseFontSize: string,
): boolean {
  try {
    if (style.type === 'PAINT' && token?.type === TokenTypes.COLOR) {
      const { value } = token;
      // For multiple colors, compare against first color for now
      if (Array.isArray(value)) {
        const firstColor = value[0]?.color;
        if (firstColor) {
          return paintStyleMatchesColorToken(style, firstColor);
        }
        return false;
      }
      // For TokenColorValue object, use its color property
      if (typeof value === 'object' && value !== null && 'color' in value) {
        return paintStyleMatchesColorToken(style, value.color);
      }
      // For string values (existing behavior)
      if (typeof value === 'string') {
        return paintStyleMatchesColorToken(style, value);
      }
      return false;
    }
    if (style.type === 'TEXT' && token?.type === TokenTypes.TYPOGRAPHY) {
      const { value } = token;
      return textStyleMatchesTypographyToken(style, value, baseFontSize);
    }
    if (style.type === 'EFFECT' && token?.type === TokenTypes.BOX_SHADOW) {
      const { value } = token;
      return effectStyleMatchesBoxShadowToken(style, value, baseFontSize);
    }
  } catch (e) {
    console.log('error in compare styles', e);
  }
  return false;
}
