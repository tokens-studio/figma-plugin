/* eslint-disable no-param-reassign */
import { SingleTypographyToken } from '@/types/tokens';
import { transformValue } from './helpers';

export default async function setTextValuesOnTarget(target: TextNode | TextStyle, token: Pick<SingleTypographyToken, 'value' | 'description'>) {
  try {
    const { value, description } = token;
    if (typeof value !== 'string') {
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
      } = value;
      const family = fontFamily?.toString() || (target.fontName !== figma.mixed ? target.fontName.family : '');
      const style = fontWeight?.toString() || (target.fontName !== figma.mixed ? target.fontName.style : '');

      try {
        if (fontFamily || fontWeight) {
          await figma.loadFontAsync({ family, style });
          target.fontName = {
            family,
            style,
          };
        }
      } catch {
        const candidateStyles = transformValue(style, 'fontWeights');
        await Promise.all(
          candidateStyles.map(async (candidateStyle) => (
            figma.loadFontAsync({ family, style: candidateStyle })
              .then(() => {
                if (candidateStyle) {
                  target.fontName = {
                    family,
                    style: candidateStyle,
                  };
                }
              })
              .catch((e) => {
                console.log('Error setting fontWeight on target', e);
              })
          )),
        );
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
      if (paragraphIndent) {
        target.paragraphIndent = transformValue(paragraphIndent, 'paragraphIndent');
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
