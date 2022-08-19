/* eslint-disable no-param-reassign */
import { SingleTypographyToken } from '@/types/tokens';
import { transformValue } from './helpers';

export default async function setTextValuesOnTarget(target: TextNode | TextStyle, token: Pick<SingleTypographyToken, 'value' | 'description'>) {
  try {
    const { value, description } = token;
    console.log('value', value);
    if (typeof value !== 'string') {
      const {
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing,
        paragraphSpacing,
        textCase,
        textDecoration,
      } = value;
      const family = fontFamily?.toString() || (target.fontName !== figma.mixed ? target.fontName.family : '');
      const style = fontWeight?.toString() || (target.fontName !== figma.mixed ? target.fontName.style : '');
      const transformedValue = transformValue(style, 'fontWeights');
      await figma.loadFontAsync({ family, style: transformedValue });
      if (fontFamily || fontWeight) {
        target.fontName = {
          family,
          style: transformedValue,
        };
      }

      if (fontSize) {
        target.fontSize = transformValue(fontSize, 'fontSizes');
      }
      if (lineHeight) {
        const transformedValue = transformValue(String(lineHeight), 'lineHeights');
        if (transformedValue !== null) {
          target.lineHeight = transformedValue;
        }
      }
      if (letterSpacing) {
        const transformedValue = transformValue(letterSpacing, 'letterSpacing');
        if (transformedValue !== null) {
          target.letterSpacing = transformedValue;
        }
      }
      if (paragraphSpacing) {
        target.paragraphSpacing = transformValue(paragraphSpacing, 'paragraphSpacing');
      }
      if (textCase) {
        target.textCase = transformValue(textCase, 'textCase');
      }
      if (textDecoration) {
        target.textDecoration = transformValue(textDecoration, 'textDecoration');
      }
      if (description && 'description' in target) {
        target.description = description;
      }
    }
  } catch (e) {
    console.log('Error setting font on target', target, token, e);
  }
}
