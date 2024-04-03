/* eslint-disable no-param-reassign */
import { SingleTypographyToken } from '@/types/tokens';
import { transformValue } from './helpers';
import { notifyUI } from './notifiers';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { TokenTypographyValue } from '@/types/values';

type ResolvedTypographyObject = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight?: string;
  letterSpacing?: string;
  paragraphSpacing?: string;
  paragraphIndent?: string;
  textCase?: string;
  textDecoration?: string;
};

function transformTypographyKeyToFigmaVariable(key: string): VariableBindableEffectField {
  switch (key) {
    case 'fontWeight':
      // @ts-expect-error - expected as plugin typings need to be updated
      return 'fontStyle' as VariableBindableTextField;
    default:
      // @ts-expect-error - expected as plugin typings need to be updated
      return key as VariableBindableTextField;
  }
}

async function tryApplyTypographyCompositeVariable({
  target, value, baseFontSize, resolvedValue,
}: {
  target: TextNode | TextStyle;
  value: TokenTypographyValue;
  baseFontSize: string;
  resolvedValue: ResolvedTypographyObject;
}) {
  const shouldCreateStylesWithVariables = defaultTokenValueRetriever.createStylesWithVariableReferences;

  try {
    if (value.fontFamily && value.fontWeight) await figma.loadFontAsync({ family: value.fontFamily, style: value.fontWeight });

    for (const [key, val] of Object.entries(resolvedValue)) {
      console.log('applying particle', key, val);
      if (val.toString().startsWith('{') && val.toString().endsWith('}') && shouldCreateStylesWithVariables) {
        const variableToApply = await defaultTokenValueRetriever.getVariableReference(val.slice(1, -1));
        if (variableToApply) {
          console.log('setting bound variable', key, variableToApply);
          // @ts-expect-error - expected as plugin typings need to be updated
          target.setBoundVariable(key, variableToApply);
        } else {
          if (key === 'fontSize' && 'fontSize' in target) {
            target.fontSize = transformValue(val, 'fontSizes', baseFontSize);
          }

          if (key === 'lineHeight' && 'lineHeight' in target) {
            const transformedValue = transformValue(String(val), 'lineHeights', baseFontSize);
            if (transformedValue !== null) {
              target.lineHeight = transformedValue;
            }
          }

          if (key === 'letterSpacing' && 'letterSpacing' in target) {
            const transformedValue = transformValue(val, 'letterSpacing', baseFontSize);
            if (transformedValue !== null) {
              target.letterSpacing = transformedValue;
            }
          }

          if (key === 'paragraphSpacing' && 'paragraphSpacing' in target) {
            target.paragraphSpacing = transformValue(val, 'paragraphSpacing', baseFontSize);
          }

          if (key === 'paragraphIndent' && 'paragraphIndent' in target) {
            target.paragraphIndent = transformValue(val, 'paragraphIndent', baseFontSize);
          }

          if (key === 'textCase' && 'textCase' in target) {
            target.textCase = transformValue(val, 'textCase', baseFontSize);
          }

          if (key === 'textDecoration' && 'textDecoration' in target) {
            target.textDecoration = transformValue(val, 'textDecoration', baseFontSize);
          }
          if (key === 'description' && 'description' in target) {
            target.description = val;
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return target;
}

export default async function setTypographyCompositeValuesOnTarget(
  target: TextNode | TextStyle,
  token: string,
  baseFontSize: string,
) {
  try {
    const resolvedToken = defaultTokenValueRetriever.get(token);
    if (typeof resolvedToken === 'undefined') return;
    const { description, value } = resolvedToken;
    const resolvedValue: ResolvedTypographyObject = defaultTokenValueRetriever.get(token)?.resolvedValueWithReferences;
    if (typeof resolvedValue === 'undefined') return;

    console.log('token value is', token, resolvedToken, resolvedValue);
    if (typeof resolvedValue !== 'string') {
      const appliedSuccessfully = await tryApplyTypographyCompositeVariable({
        target, value, baseFontSize, resolvedValue,
      });
      // const {
      //   fontFamily,
      //   fontWeight,
      // } = value;

      // const family = fontFamily?.toString() || (target.fontName !== figma.mixed ? target.fontName.family : '');
      // const style = fontWeight?.toString() || (target.fontName !== figma.mixed ? target.fontName.style : '');

      // try {
      //   await figma.loadFontAsync({ family, style });
      //   if (fontFamily || fontWeight) {
      //     target.fontName = {
      //       family,
      //       style,
      //     };
      //   }
      // } catch (e) {
      //   const splitFontFamily = family.split(',');
      //   const candidateStyles = transformValue(style, 'fontWeights', baseFontSize);
      //   const candidateFonts: { family: string; style: string }[] = [];
      //   splitFontFamily?.forEach((candidateFontFamily) => {
      //     const normalizedFontFamily = candidateFontFamily?.replace(/['"]/g, '').trim();
      //     if (candidateStyles.length > 0) {
      //       candidateStyles.forEach((candidateStyle) => {
      //         candidateFonts.push({
      //           family: normalizedFontFamily,
      //           style: candidateStyle,
      //         });
      //       });
      //     } else {
      //       candidateFonts.push({
      //         family: normalizedFontFamily,
      //         style,
      //       });
      //     }
      //   });

      //   const hasErrored = false;

      //   // for (let i = 0; i < candidateFonts.length; i += 1) {
      //   //   let isApplied = false; // if font is applied then skip other font families
      //   //   await figma
      //   //     .loadFontAsync({ family: candidateFonts[i].family, style: candidateFonts[i].style })
      //   //     .then(() => {
      //   //       if (candidateFonts[i]) {
      //   //         target.fontName = {
      //   //           family: candidateFonts[i].family,
      //   //           style: candidateFonts[i].style,
      //   //         };
      //   //         isApplied = true;
      //   //       }
      //   //     })
      //   //     // eslint-disable-next-line @typescript-eslint/no-loop-func
      //   //     .catch(() => {
      //   //       hasErrored = true;
      //   //     });
      //   //   if (isApplied) {
      //   //     hasErrored = false;
      //   //     break;
      //   //   }
      //   // }
      //   if (hasErrored) {
      //     notifyUI(`Error setting font family/weight combination for ${family}/${style}`);
      //   }
      // }
    }
  } catch (e) {
    console.log('Error setting font on target', target, token, e);
  }
}
