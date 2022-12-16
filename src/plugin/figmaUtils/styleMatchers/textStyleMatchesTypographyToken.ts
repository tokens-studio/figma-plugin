import { transformValue } from '../../helpers';
import { TokenTypographyValue } from '@/types/values';

export function textStyleMatchesTypographyToken(
  textStyle: TextStyle | undefined,
  typographyToken: string | TokenTypographyValue,
  baseFontSize: string,
) {
  if (!textStyle || typeof typographyToken === 'string') {
    return false;
  }

  const {
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing,
    paragraphSpacing,
    paragraphIndent,
    textCase,
    textDecoration,
  } = typographyToken;

  if (textStyle.fontName.family !== fontFamily) {
    return false;
  }
  if (textStyle.fontName.style !== fontWeight) {
    return false;
  }
  if (fontSize === undefined || textStyle.fontSize !== transformValue(fontSize, 'fontSizes', baseFontSize)) {
    return false;
  }
  // This will default to `{ unit: 'AUTO' }` if lineHeight token is not set:
  const tokenLineHeight = transformValue(String(lineHeight), 'lineHeights', baseFontSize);
  if (tokenLineHeight?.unit !== textStyle.lineHeight.unit) {
    let hasMismatch = true;
    if (tokenLineHeight && tokenLineHeight.unit !== 'AUTO' && textStyle.lineHeight.unit !== 'AUTO') {
      hasMismatch = tokenLineHeight.value > 0 || textStyle.lineHeight.value > 0;
    }
    if (hasMismatch) {
      return false;
    }
  } else if (tokenLineHeight.unit !== 'AUTO' && textStyle.lineHeight.unit !== 'AUTO') {
    if (tokenLineHeight.unit !== textStyle.lineHeight.unit || tokenLineHeight.value !== textStyle.lineHeight.value) {
      return false;
    }
  }
  // This will default to `null` if letterSpacing token is not set:
  const tokenLetterSpacing = transformValue(String(letterSpacing), 'letterSpacing', baseFontSize);
  if (
    tokenLetterSpacing?.unit !== textStyle.letterSpacing.unit
    || tokenLetterSpacing?.value !== textStyle.letterSpacing.value
  ) {
    if ((tokenLetterSpacing?.value && tokenLetterSpacing.value > 0) || textStyle.letterSpacing.value > 0) {
      return false;
    }
  }
  if (
    paragraphSpacing === undefined
    || textStyle.paragraphSpacing !== transformValue(paragraphSpacing, 'paragraphSpacing', baseFontSize)
  ) {
    return false;
  }
  if (
    paragraphIndent === undefined
    || textStyle.paragraphIndent !== transformValue(paragraphIndent, 'paragraphIndent', baseFontSize)
  ) {
    return false;
  }
  // This will default to `ORIGINAL` if textCase token is not set:
  const tokenTextCase = transformValue(String(textCase), 'textCase', baseFontSize);
  if (tokenTextCase !== textStyle.textCase) {
    return false;
  }
  // This will default to `NONE` if textDecoration token is not set:
  const tokenTextDecoration = transformValue(String(textDecoration), 'textDecoration', baseFontSize);
  if (tokenTextDecoration !== textStyle.textDecoration) {
    return false;
  }
  return true; //  All checks passed - text style matches typography token
}
