import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
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
      return paintStyleMatchesColorToken(style, value);
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
