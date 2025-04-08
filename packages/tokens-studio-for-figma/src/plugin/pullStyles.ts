/* eslint-disable no-param-reassign */
import compact from 'just-compact';
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { SingleColorToken, SingleToken } from '@/types/tokens';
import { convertBoxShadowTypeFromFigma } from './figmaTransforms/boxShadow';
import { convertFigmaGradientToString } from './figmaTransforms/gradients';
import { convertFigmaToLetterSpacing } from './figmaTransforms/letterSpacing';
import { convertFigmaToLineHeight } from './figmaTransforms/lineHeight';
import { convertFigmaToTextCase } from './figmaTransforms/textCase';
import { convertFigmaToTextDecoration } from './figmaTransforms/textDecoration';
import { notifyStyleValues } from './notifiers';
import { PullStyleOptions } from '@/types';
import { slugify } from '@/utils/string';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenBoxshadowValue } from '@/types/values';
import { StyleToCreateToken } from '@/types/payloads';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { getTokenData } from './node';

export default async function pullStyles(styleTypes: PullStyleOptions): Promise<void> {
  const tokens = await getTokenData();
  // @TODO should be specifically typed according to their type
  let colors: StyleToCreateToken[] = [];
  let typography: StyleToCreateToken[] = [];
  let effects: StyleToCreateToken[] = [];
  let fontFamilies: StyleToCreateToken[] = [];
  let lineHeights: StyleToCreateToken[] = [];
  let fontWeights: StyleToCreateToken[] = [];
  let fontSizes: StyleToCreateToken[] = [];
  let letterSpacing: StyleToCreateToken[] = [];
  let paragraphSpacing: StyleToCreateToken[] = [];
  let paragraphIndent: any[] = [];
  let textCase: StyleToCreateToken[] = [];
  let textDecoration: StyleToCreateToken[] = [];
  if (styleTypes.colorStyles) {
    colors = compact(
      figma
        .getLocalPaintStyles()
        .filter((style) => style.paints.length === 1)
        .map((style) => {
          const paint = style.paints[0];
          let styleObject: SingleColorToken | null = {} as SingleColorToken;
          if (style.description) {
            styleObject.description = style.description;
          }
          if (paint.type === 'SOLID') {
            const { r, g, b } = paint.color;
            const a = paint.opacity;
            styleObject.value = figmaRGBToHex({
              r,
              g,
              b,
              a,
            });
          } else if (paint.type === 'GRADIENT_LINEAR') {
            styleObject.value = convertFigmaGradientToString(paint);
          } else {
            styleObject = null;
          }
          const normalizedName = style.name
            .split('/')
            .map((section) => section.trim())
            .join('.');

          return styleObject
            ? {
              ...styleObject,
              name: normalizedName,
              type: TokenTypes.COLOR,
            }
            : null;
        }),
    );
  }

  if (styleTypes.textStyles) {
    const rawFontSizes: number[] = [];
    const fontCombinations: FontName[] = [];
    const rawLineHeights: LineHeight[] = [];
    const rawParagraphSpacing: number[] = [];
    const rawParagraphIndent: number[] = [];
    const rawLetterSpacing: LetterSpacing[] = [];
    const rawTextCase: TextCase[] = [];
    const rawTextDecoration: TextDecoration[] = [];

    const figmaTextStyles = figma.getLocalTextStyles();
    const localVariables = await getVariablesWithoutZombies();

    figmaTextStyles.forEach((style) => {
      if (!rawFontSizes.includes(style.fontSize)) rawFontSizes.push(style.fontSize);
      fontCombinations.push(style.fontName);
      rawLineHeights.push(style.lineHeight);
      if (!rawParagraphSpacing.includes(style.paragraphSpacing)) rawParagraphSpacing.push(style.paragraphSpacing);
      if (!rawParagraphIndent.includes(style.paragraphIndent)) rawParagraphIndent.push(style.paragraphIndent);
      rawLetterSpacing.push(style.letterSpacing);
      if (!rawTextCase.includes(style.textCase)) rawTextCase.push(style.textCase);
      if (!rawTextDecoration.includes(style.textDecoration)) rawTextDecoration.push(style.textDecoration);
    });

    fontSizes = figmaTextStyles.map((style, idx) => {
      if (style.boundVariables?.fontSize?.id) {
        const fontSizeVar = localVariables.find((v) => v.id === style.boundVariables?.fontSize?.id);
        if (fontSizeVar && tokens) {
          const normalizedName = fontSizeVar.name.replace(/\//g, '.');

          const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
            if (found) return found;
            const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
                  && token !== null
                  && 'name' in token
                  && token.name === normalizedName) : null;

            return foundToken || null;
          }, null);

          if (existingToken) {
            return {
              name: existingToken.name,
              value: String(existingToken.value),
              type: TokenTypes.FONT_SIZES,
            };
          }
        }
      }
      return {
        name: `fontSize.${idx}`,
        value: style.fontSize.toString(),
        type: TokenTypes.FONT_SIZES,
      };
    }) as StyleToCreateToken[];

    const uniqueFontCombinations = fontCombinations.filter(
      (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i,
    );

    lineHeights = figmaTextStyles.map((style, idx) => {
      if (style.boundVariables?.lineHeight?.id) {
        const lineHeightVar = localVariables.find((v) => v.id === style.boundVariables?.lineHeight?.id);
        if (lineHeightVar && tokens) {
          const normalizedName = lineHeightVar.name.replace(/\//g, '.');

          const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
            if (found) return found;
            const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
              && token !== null
              && 'name' in token
              && token.name === normalizedName) : null;
            return foundToken || null;
          }, null);

          if (existingToken) {
            return {
              name: existingToken.name,
              value: (existingToken as unknown as SingleToken).value,
              type: TokenTypes.LINE_HEIGHTS,
            };
          }
        }
      }
      return {
        name: `lineHeights.${idx}`,
        value: convertFigmaToLineHeight(style.lineHeight).toString(),
        type: TokenTypes.LINE_HEIGHTS,
      };
    });

    fontWeights = uniqueFontCombinations.map((font, idx) => {
      const matchingStyle = figmaTextStyles.find((style) => style.fontName.family === font.family
        && style.fontName.style === font.style);

      if (matchingStyle?.boundVariables?.fontStyle?.id) {
        const fontStyleVar = localVariables.find((v) => v.id === matchingStyle.boundVariables?.fontStyle?.id);
        if (fontStyleVar && tokens) {
          const normalizedName = fontStyleVar.name.replace(/\//g, '.');

          const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
            if (found) return found;
            const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
              && token !== null
              && 'name' in token
              && token.name === normalizedName) : null;
            return foundToken || null;
          }, null);

          if (existingToken) {
            return {
              name: existingToken.name,
              value: (existingToken as unknown as SingleToken).value,
              type: TokenTypes.FONT_WEIGHTS,
            };
          }
        }
      }

      return {
        name: `fontWeights.${slugify(font.family)}-${idx}`,
        value: font.style,
        type: TokenTypes.FONT_WEIGHTS,
      };
    });

    fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((fontFamily) => {
      const matchingStyle = figmaTextStyles.find((style) => style.fontName.family === fontFamily);

      if (matchingStyle?.boundVariables?.fontFamily?.id) {
        const fontFamilyVar = localVariables.find((v) => v.id === matchingStyle.boundVariables?.fontFamily?.id);
        if (fontFamilyVar && tokens) {
          const normalizedName = fontFamilyVar.name.replace(/\//g, '.');

          const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
            if (found) return found;
            const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
              && token !== null
              && 'name' in token
              && token.name === normalizedName) : null;
            return foundToken || null;
          }, null);

          if (existingToken) {
            return {
              name: existingToken.name,
              value: (existingToken as unknown as SingleToken).value,
              type: TokenTypes.FONT_FAMILIES,
            };
          }
        }
      }

      return {
        name: `fontFamilies.${slugify(fontFamily)}`,
        value: fontFamily,
        type: TokenTypes.FONT_FAMILIES,
      };
    });

    console.log('fontFamilies', fontFamilies);

    fontSizes = figmaTextStyles.map((style, idx) => {
      if (style.boundVariables?.fontSize?.id) {
        const fontSizeVar = localVariables.find((v) => v.id === style.boundVariables?.fontSize?.id);
        if (fontSizeVar && tokens) {
          const normalizedName = fontSizeVar.name.replace(/\//g, '.');

          const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
            if (found) return found;
            const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
                  && token !== null
                  && 'name' in token
                  && token.name === normalizedName) : null;

            return foundToken || null;
          }, null);

          if (existingToken) {
            return {
              name: existingToken.name,
              value: String(existingToken.value),
              type: TokenTypes.FONT_SIZES,
            };
          }
        }
      }
      return {
        name: `fontSize.${idx}`,
        value: style.fontSize.toString(),
        type: TokenTypes.FONT_SIZES,
      };
    }) as StyleToCreateToken[];

    paragraphSpacing = figmaTextStyles.map((style, idx) => {
      if (style.boundVariables?.paragraphSpacing?.id) {
        const paragraphSpacingVar = localVariables.find((v) => v.id === style.boundVariables?.paragraphSpacing?.id);
        if (paragraphSpacingVar && tokens) {
          const normalizedName = paragraphSpacingVar.name.replace(/\//g, '.');

          const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
            if (found) return found;
            const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
              && token !== null
              && 'name' in token
              && token.name === normalizedName) : null;
            return foundToken || null;
          }, null);

          if (existingToken) {
            return {
              name: existingToken.name,
              value: (existingToken as unknown as SingleToken).value,
              type: TokenTypes.PARAGRAPH_SPACING,
            };
          }
        }
      }
      return {
        name: `paragraphSpacing.${idx}`,
        value: style.paragraphSpacing.toString(),
        type: TokenTypes.PARAGRAPH_SPACING,
      };
    });

    paragraphIndent = rawParagraphIndent
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphIndent.${idx}`,
        value: `${size.toString()}px`,
        type: TokenTypes.DIMENSION,
      }));

    letterSpacing = figmaTextStyles.map((style, idx) => {
      if (style.boundVariables?.letterSpacing?.id) {
        const letterSpacingVar = localVariables.find((v) => v.id === style.boundVariables?.letterSpacing?.id);
        if (letterSpacingVar && tokens) {
          const normalizedName = letterSpacingVar.name.replace(/\//g, '.');

          const existingToken = Object.entries(tokens.values).reduce<SingleToken | null>((found, [_, tokenSet]) => {
            if (found) return found;
            const foundToken = Array.isArray(tokenSet) ? tokenSet.find((token) => typeof token === 'object'
              && token !== null
              && 'name' in token
              && token.name === normalizedName) : null;
            return foundToken || null;
          }, null);

          if (existingToken) {
            return {
              name: existingToken.name,
              value: (existingToken as unknown as SingleToken).value,
              type: TokenTypes.LETTER_SPACING,
            };
          }
        }
      }
      return {
        name: `letterSpacing.${idx}`,
        value: convertFigmaToLetterSpacing(style.letterSpacing).toString(),
        type: TokenTypes.LETTER_SPACING,
      };
    });

    textCase = rawTextCase.map((value) => ({
      name: `textCase.${convertFigmaToTextCase(value)}`,
      value: convertFigmaToTextCase(value),
      type: TokenTypes.TEXT_CASE,
    }));

    textDecoration = rawTextDecoration.map((value) => ({
      name: `textDecoration.${convertFigmaToTextDecoration(value)}`,
      value: convertFigmaToTextDecoration(value),
      type: TokenTypes.TEXT_DECORATION,
    }));

    typography = figmaTextStyles.map((style) => {
      const foundFamily = fontFamilies.find((el: StyleToCreateToken) => {
        if (style.boundVariables?.fontFamily?.id) {
          const fontFamilyVar = localVariables.find((v) => v.id === style.boundVariables?.fontFamily?.id);
          if (fontFamilyVar) {
            const normalizedName = fontFamilyVar.name.replace(/\//g, '.');
            return el.name === normalizedName;
          }
        }
        return el.value === style.fontName.family;
      });

      const foundFontWeight = fontWeights.find((el: StyleToCreateToken) => {
        if (style.boundVariables?.fontStyle?.id) {
          const fontStyleVar = localVariables.find((v) => v.id === style.boundVariables?.fontStyle?.id);
          if (fontStyleVar) {
            const normalizedName = fontStyleVar.name.replace(/\//g, '.');
            return el.name === normalizedName;
          }
        }
        return el.name.includes(slugify(style.fontName.family)) && el.value === style.fontName?.style;
      });

      const foundLineHeight = lineHeights.find((el: StyleToCreateToken) => {
        if (style.boundVariables?.lineHeight?.id) {
          const lineHeightVar = localVariables.find((v) => v.id === style.boundVariables?.lineHeight?.id);
          if (lineHeightVar) {
            const normalizedName = lineHeightVar.name.replace(/\//g, '.');
            return el.name === normalizedName;
          }
        }
        return el.value === convertFigmaToLineHeight(style.lineHeight).toString();
      });
      const foundFontSize = fontSizes.find((el: StyleToCreateToken) => {
        if (style.boundVariables?.fontSize?.id) {
          const fontSizeVar = localVariables.find((v) => v.id === style.boundVariables?.fontSize?.id);
          if (fontSizeVar) {
            const normalizedName = fontSizeVar.name.replace(/\//g, '.');
            return el.name === normalizedName;
          }
        }
        return el.value === style.fontSize.toString();
      });
      const foundLetterSpacing = letterSpacing.find((el: StyleToCreateToken) => {
        if (style.boundVariables?.letterSpacing?.id) {
          const letterSpacingVar = localVariables.find((v) => v.id === style.boundVariables?.letterSpacing?.id);
          if (letterSpacingVar) {
            const normalizedName = letterSpacingVar.name.replace(/\//g, '.');
            return el.name === normalizedName;
          }
        }
        return el.value === convertFigmaToLetterSpacing(style.letterSpacing).toString();
      });
      const foundParagraphSpacing = paragraphSpacing.find((el: StyleToCreateToken) => {
        if (style.boundVariables?.paragraphSpacing?.id) {
          const paragraphSpacingVar = localVariables.find((v) => v.id === style.boundVariables?.paragraphSpacing?.id);
          if (paragraphSpacingVar) {
            const normalizedName = paragraphSpacingVar.name.replace(/\//g, '.');
            return el.name === normalizedName;
          }
        }
        return el.value === style.paragraphSpacing.toString();
      });
      const foundParagraphIndent = paragraphIndent.find(
        (el: StyleToCreateToken) => el.value === `${style.paragraphIndent.toString()}px`,
      );
      const foundTextCase = textCase.find(
        (el: StyleToCreateToken) => el.value === convertFigmaToTextCase(style.textCase.toString()),
      );
      const foundTextDecoration = textDecoration.find(
        (el: StyleToCreateToken) => el.value === convertFigmaToTextDecoration(style.textDecoration.toString()),
      );

      const obj = {
        fontFamily: `{${foundFamily?.name}}`,
        fontWeight: `{${foundFontWeight?.name}}`,
        lineHeight: `{${foundLineHeight?.name}}`,
        fontSize: `{${foundFontSize?.name}}`,
        letterSpacing: `{${foundLetterSpacing?.name}}`,
        paragraphSpacing: `{${foundParagraphSpacing?.name}}`,
        paragraphIndent: `{${foundParagraphIndent?.name}}`,
        textCase: `{${foundTextCase?.name}}`,
        textDecoration: `{${foundTextDecoration?.name}}`,
      };

      const normalizedName = style.name
        .split('/')
        .map((section) => section.trim())
        .join('.');

      const styleObject: StyleToCreateToken = { name: normalizedName, value: obj, type: TokenTypes.TYPOGRAPHY };

      if (style.description) {
        styleObject.description = style.description;
      }

      return styleObject;
    });
  }

  if (styleTypes.effectStyles) {
    effects = compact(
      figma
        .getLocalEffectStyles()
        .filter((style) => style.effects.every((effect) => ['DROP_SHADOW', 'INNER_SHADOW'].includes(effect.type)))
        .map((style) => {
          const styleEffects = style.effects as DropShadowEffect[];
          const reversedEffects = [...styleEffects].reverse();
          // convert paint to object containg x, y, spread, color
          const shadows: TokenBoxshadowValue[] = reversedEffects.map((effect) => {
            const effectObject: TokenBoxshadowValue = {} as TokenBoxshadowValue;

            effectObject.color = figmaRGBToHex(effect.color);
            effectObject.type = convertBoxShadowTypeFromFigma(effect.type);
            effectObject.x = effect.offset.x;
            effectObject.y = effect.offset.y;
            effectObject.blur = effect.radius;
            effectObject.spread = effect.spread || 0;

            return effectObject;
          });

          if (!shadows) return null;

          const normalizedName = style.name
            .split('/')
            .map((section) => section.trim())
            .join('.');

          const styleObject: StyleToCreateToken = {
            value: shadows.length > 1 ? shadows : shadows[0],
            type: TokenTypes.BOX_SHADOW,
            name: normalizedName,
          };
          if (style.description) {
            styleObject.description = style.description;
          }

          return styleObject;
        }),
    );
  }

  const stylesObject = {
    colors,
    effects,
    fontFamilies,
    lineHeights,
    fontWeights,
    fontSizes,
    letterSpacing,
    paragraphSpacing,
    typography,
    textCase,
    textDecoration,
    paragraphIndent,
  };

 type ResultObject = Record<string, StyleToCreateToken[]>;

 const returnedObject = Object.entries(stylesObject).reduce<ResultObject>((acc, [key, value]) => {
   if (value.length > 0) {
     acc[key] = value;
   }
   return acc;
 }, {});

 notifyStyleValues(returnedObject);
}
