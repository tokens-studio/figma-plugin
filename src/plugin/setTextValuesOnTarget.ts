/* eslint-disable no-param-reassign */
import { SingleTypographyToken } from '@/types/tokens';
import { transformValue } from './helpers';
import { trackFromPlugin, notifyUI } from './notifiers';

export default async function setTextValuesOnTarget(
  target: TextNode | TextStyle,
  token: Pick<SingleTypographyToken, 'value' | 'description'>,
  baseFontSize: string,
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
        const candidateStyles = transformValue(style, 'fontWeights', baseFontSize);
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

        let hasErrored = false;

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
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            .catch(() => {
              hasErrored = true;
            });
          if (isApplied) {
            hasErrored = false;
            break;
          }
        }
        if (hasErrored) {
          notifyUI(`Error setting font family/weight combination for ${family}/${style}`);
          trackFromPlugin('Font not found', { family, style });
        }
      }
      try {
        if (typeof fontSize !== 'undefined') {
          target.fontSize = transformValue(fontSize, 'fontSizes', baseFontSize);
        }
      } catch (e) {
        console.log('Error setting fontSize on target', target, token, e);
      }
      try {
        if (typeof lineHeight !== 'undefined') {
          const transformedValue = transformValue(String(lineHeight), 'lineHeights', baseFontSize);
          if (transformedValue !== null) {
            target.lineHeight = transformedValue;
          }
        }
      } catch (e) {
        console.log('Error setting lineHeight on target', target, token, e);
      }
      try {
        if (typeof letterSpacing !== 'undefined') {
          const transformedValue = transformValue(letterSpacing, 'letterSpacing', baseFontSize);
          if (transformedValue !== null) {
            target.letterSpacing = transformedValue;
          }
        }
      } catch (e) {
        console.log('Error setting letterSpacing on target', target, token, e);
      }
      try {
        if (typeof paragraphSpacing !== 'undefined') {
          target.paragraphSpacing = transformValue(paragraphSpacing, 'paragraphSpacing', baseFontSize);
        }
      } catch (e) {
        console.log('Error setting paragraphSpacing on target', target, token, e);
      }
      try {
        if (typeof paragraphIndent !== 'undefined') {
          target.paragraphIndent = transformValue(paragraphIndent, 'paragraphIndent', baseFontSize);
        }
      } catch (e) {
        console.log('Error setting paragraphIndent on target', target, token, e);
      }
      try {
        if (textCase) {
          target.textCase = transformValue(textCase, 'textCase', baseFontSize);
        }
      } catch (e) {
        console.log('Error setting textCase on target', target, token, e);
      }
      try {
        if (textDecoration) {
          target.textDecoration = transformValue(textDecoration, 'textDecoration', baseFontSize);
        }
      } catch (e) {
        console.log('Error setting textDecoration on target', target, token, e);
      }
      if (description && 'description' in target) {
        target.description = description;
      }
    }
  } catch (e) {
    console.log('Error setting font on target', target, token, e);
  }
}
