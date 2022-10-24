/* eslint-disable no-param-reassign */
import { SingleTypographyToken } from '@/types/tokens';
import { transformValue } from './helpers';

export default async function setTextValuesOnTarget(
  target: TextNode | TextStyle,
  token: Pick<SingleTypographyToken, 'value' | 'description'>,
) {
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
        await figma.loadFontAsync({ family, style });
        if (fontFamily || fontWeight) {
          target.fontName = {
            family,
            style,
          };
        }
      } catch (e) {
        const splitFontFamily = family.split(',');
        const candidateStyles = transformValue(style, 'fontWeights');
        const candidateFonts: { family: string; style: string }[] = [];
        splitFontFamily?.forEach((candidateFontFamily) => {
          const normalizedFontFamily = candidateFontFamily?.replace(/['"]/g, '').trim();
          if (candidateStyles.length > 0) {
            candidateStyles.forEach((candidateStyle) => {
              candidateFonts.push({
                family: normalizedFontFamily,
                style: candidateStyle,
              });
            });
          } else {
            candidateFonts.push({
              family: normalizedFontFamily,
              style,
            });
          }
        });

        for (let i = 0; i < candidateFonts.length; i += 1) {
          let isApplied = false; // if font is applied then skip other font families
          await figma
            .loadFontAsync({ family: candidateFonts[i].family, style: candidateFonts[i].style })
            .then(() => {
              if (candidateFonts[i]) {
                target.fontName = {
                  family: candidateFonts[i].family,
                  style: candidateFonts[i].style,
                };
                isApplied = true;
              }
            })
            .catch(() => {
              // TODO: Track this in mixpanel so we can add missing weights
            });
          if (isApplied) break;
        }
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
