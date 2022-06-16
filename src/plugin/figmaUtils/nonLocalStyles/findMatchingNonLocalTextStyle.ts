import { transformValue } from '../../helpers';
import { TokenTypograpyValue } from '@/types/values';

export function findMatchingNonLocalTextStyle(
  styleId: string,
  typographyToken: string | TokenTypograpyValue,
  description?: string,
) {
  let matchingStyle: TextStyle | undefined;

  if (styleId) {
    const nonLocalStyle = figma.getStyleById(styleId);
    if (typeof typographyToken !== 'string' && nonLocalStyle?.type === 'TEXT') {
      const textStyle = nonLocalStyle as TextStyle;
      matchingStyle = textStyle; // Assume match until it checks out otherwise below

      const {
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing,
        paragraphSpacing,
        textCase,
        textDecoration,
      } = typographyToken;

      if (textStyle.fontName.family !== fontFamily) {
        matchingStyle = undefined;
      }
      if (textStyle.fontName.style !== fontWeight) {
        matchingStyle = undefined;
      }
      if (fontSize === undefined || textStyle.fontSize !== transformValue(fontSize, 'fontSizes')) {
        matchingStyle = undefined;
      }
      // This will default to `{ unit: 'AUTO' }` if lineHeight token is not set:
      const tokenLineHeight = transformValue(String(lineHeight), 'lineHeights');
      if (tokenLineHeight?.unit !== textStyle.lineHeight.unit) {
        let hasMismatch = true;
        if (tokenLineHeight && tokenLineHeight.unit !== 'AUTO' && textStyle.lineHeight.unit !== 'AUTO') {
          hasMismatch = tokenLineHeight.value > 0 || textStyle.lineHeight.value > 0;
        }
        if (hasMismatch) {
          matchingStyle = undefined;
        }
      } else if (tokenLineHeight.unit !== 'AUTO' && textStyle.lineHeight.unit !== 'AUTO') {
        if (
          tokenLineHeight.unit !== textStyle.lineHeight.unit
          || tokenLineHeight.value !== textStyle.lineHeight.value
        ) {
          matchingStyle = undefined;
        }
      }
      // This will default to `null` if letterSpacing token is not set:
      const tokenLetterSpacing = transformValue(String(letterSpacing), 'letterSpacing');
      if (
        tokenLetterSpacing?.unit !== textStyle.letterSpacing.unit
        || tokenLetterSpacing?.value !== textStyle.letterSpacing.value
      ) {
        if ((tokenLetterSpacing?.value && tokenLetterSpacing.value > 0) || textStyle.letterSpacing.value > 0) {
          matchingStyle = undefined;
        }
      }
      if (
        paragraphSpacing === undefined
        || textStyle.paragraphSpacing !== transformValue(paragraphSpacing, 'paragraphSpacing')
      ) {
        matchingStyle = undefined;
      }
      // This will default to `ORIGINAL` if textCase token is not set:
      const tokenTextCase = transformValue(String(textCase), 'textCase');
      if (tokenTextCase !== textStyle.textCase) {
        matchingStyle = undefined;
      }
      // This will default to `NONE` if textDecoration token is not set:
      const tokenTextDecoration = transformValue(String(textDecoration), 'textDecoration');
      if (tokenTextDecoration !== textStyle.textDecoration) {
        matchingStyle = undefined;
      }
      // TODO: Should description also match? 🤷
      if (textStyle.description !== '' && textStyle.description !== description) {
        // matchingStyle = undefined;
      }
    }
  }

  return matchingStyle;
}
