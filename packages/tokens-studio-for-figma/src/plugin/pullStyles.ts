/* eslint-disable no-param-reassign */
import compact from 'just-compact';
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { SingleColorToken } from '@/types/tokens';
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
import { processTextStyleProperty } from './processTextStyleProperty';
import { findBoundVariable } from '@/utils/findBoundVariable';

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
          } else if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
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
      try {
        // Safe property access with null/undefined checks
        if (typeof style.fontSize === 'number' && !rawFontSizes.includes(style.fontSize)) {
          rawFontSizes.push(style.fontSize);
        }

        if (style.fontName && typeof style.fontName === 'object' && style.fontName.family && style.fontName.style) {
          fontCombinations.push(style.fontName);
        }

        if (style.lineHeight && typeof style.lineHeight === 'object') {
          rawLineHeights.push(style.lineHeight);
        }

        if (typeof style.paragraphSpacing === 'number' && !rawParagraphSpacing.includes(style.paragraphSpacing)) {
          rawParagraphSpacing.push(style.paragraphSpacing);
        }

        if (typeof style.paragraphIndent === 'number' && !rawParagraphIndent.includes(style.paragraphIndent)) {
          rawParagraphIndent.push(style.paragraphIndent);
        }

        if (style.letterSpacing && typeof style.letterSpacing === 'object') {
          rawLetterSpacing.push(style.letterSpacing);
        }

        if (style.textCase && typeof style.textCase === 'string' && !rawTextCase.includes(style.textCase)) {
          rawTextCase.push(style.textCase);
        }

        if (style.textDecoration && typeof style.textDecoration === 'string' && !rawTextDecoration.includes(style.textDecoration)) {
          rawTextDecoration.push(style.textDecoration);
        }
      } catch (error) {
        console.warn(`Error processing text style "${style?.name || 'unknown'}":`, error);
        // Continue processing other styles
      }
    });

    fontSizes = figmaTextStyles.map((style, idx) => {
      try {
        if (!style || typeof style.fontSize !== 'number') {
          return {
            name: `fontSize.${idx}`,
            value: '0',
            type: TokenTypes.FONT_SIZES,
          };
        }
        return processTextStyleProperty(
          style,
          'fontSize',
          localVariables,
          tokens,
          TokenTypes.FONT_SIZES,
          'fontSize',
          idx,
          (value) => value.toString(),
        );
      } catch (error) {
        console.warn(`Error processing fontSize for style "${style?.name || 'unknown'}":`, error);
        return {
          name: `fontSize.${idx}`,
          value: '0',
          type: TokenTypes.FONT_SIZES,
        };
      }
    });

    const uniqueFontCombinations = fontCombinations.filter(
      (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i,
    );

    lineHeights = figmaTextStyles.map((style, idx) => {
      try {
        if (!style || !style.lineHeight) {
          return {
            name: `lineHeights.${idx}`,
            value: 'AUTO',
            type: TokenTypes.LINE_HEIGHTS,
          };
        }
        return processTextStyleProperty(
          style,
          'lineHeight',
          localVariables,
          tokens,
          TokenTypes.LINE_HEIGHTS,
          'lineHeights',
          idx,
          (value) => convertFigmaToLineHeight(value).toString(),
        );
      } catch (error) {
        console.warn(`Error processing lineHeight for style "${style?.name || 'unknown'}":`, error);
        return {
          name: `lineHeights.${idx}`,
          value: 'AUTO',
          type: TokenTypes.LINE_HEIGHTS,
        };
      }
    });

    fontWeights = uniqueFontCombinations.map((font, idx) => {
      try {
        if (!font || !font.family || !font.style) {
          return {
            name: `fontWeights.unknown-${idx}`,
            value: 'Regular',
            type: TokenTypes.FONT_WEIGHTS,
          };
        }

        const matchingStyle = figmaTextStyles.find((style) => style?.fontName?.family === font.family
  && style?.fontName?.style === font.style);

        if (!matchingStyle) {
          return {
            name: `fontWeights.${slugify(font.family)}-${idx}`,
            value: font.style,
            type: TokenTypes.FONT_WEIGHTS,
          };
        }

        return processTextStyleProperty(
          matchingStyle,
          'fontStyle',
          localVariables,
          tokens,
          TokenTypes.FONT_WEIGHTS,
          `fontWeights.${slugify(font.family)}`,
          idx,
          () => font.style,
        );
      } catch (error) {
        console.warn(`Error processing fontWeight for font "${font?.family || 'unknown'}":`, error);
        return {
          name: `fontWeights.unknown-${idx}`,
          value: 'Regular',
          type: TokenTypes.FONT_WEIGHTS,
        };
      }
    });

    fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font?.family).filter(Boolean))].map((fontFamily, idx) => {
      try {
        if (!fontFamily) {
          return {
            name: `fontFamilies.unknown-${idx}`,
            value: 'Arial',
            type: TokenTypes.FONT_FAMILIES,
          };
        }

        const matchingStyle = figmaTextStyles.find((style) => style?.fontName?.family === fontFamily);

        if (!matchingStyle) {
          return {
            name: `fontFamilies.${slugify(fontFamily)}`,
            value: fontFamily,
            type: TokenTypes.FONT_FAMILIES,
          };
        }

        return processTextStyleProperty(
          matchingStyle,
          'fontFamily',
          localVariables,
          tokens,
          TokenTypes.FONT_FAMILIES,
          `fontFamilies.${slugify(fontFamily)}`,
          idx,
          () => fontFamily,
        );
      } catch (error) {
        console.warn(`Error processing fontFamily "${fontFamily || 'unknown'}":`, error);
        return {
          name: `fontFamilies.unknown-${idx}`,
          value: 'Arial',
          type: TokenTypes.FONT_FAMILIES,
        };
      }
    });

    paragraphSpacing = figmaTextStyles.map((style, idx) => {
      try {
        if (!style || typeof style.paragraphSpacing !== 'number') {
          return {
            name: `paragraphSpacing.${idx}`,
            value: '0',
            type: TokenTypes.PARAGRAPH_SPACING,
          };
        }
        return processTextStyleProperty(
          style,
          'paragraphSpacing',
          localVariables,
          tokens,
          TokenTypes.PARAGRAPH_SPACING,
          'paragraphSpacing',
          idx,
          (value) => value.toString(),
        );
      } catch (error) {
        console.warn(`Error processing paragraphSpacing for style "${style?.name || 'unknown'}":`, error);
        return {
          name: `paragraphSpacing.${idx}`,
          value: '0',
          type: TokenTypes.PARAGRAPH_SPACING,
        };
      }
    });

    paragraphIndent = rawParagraphIndent
      .filter((size) => typeof size === 'number')
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphIndent.${idx}`,
        value: `${size.toString()}px`,
        type: TokenTypes.DIMENSION,
      }));

    letterSpacing = figmaTextStyles.map((style, idx) => {
      try {
        if (!style || !style.letterSpacing) {
          return {
            name: `letterSpacing.${idx}`,
            value: '0',
            type: TokenTypes.LETTER_SPACING,
          };
        }
        return processTextStyleProperty(
          style,
          'letterSpacing',
          localVariables,
          tokens,
          TokenTypes.LETTER_SPACING,
          'letterSpacing',
          idx,
          (value) => convertFigmaToLetterSpacing(value).toString(),
        );
      } catch (error) {
        console.warn(`Error processing letterSpacing for style "${style?.name || 'unknown'}":`, error);
        return {
          name: `letterSpacing.${idx}`,
          value: '0',
          type: TokenTypes.LETTER_SPACING,
        };
      }
    });

    textCase = rawTextCase.filter((value) => value && typeof value === 'string').map((value) => ({
      name: `textCase.${convertFigmaToTextCase(value)}`,
      value: convertFigmaToTextCase(value),
      type: TokenTypes.TEXT_CASE,
    }));

    textDecoration = rawTextDecoration.filter((value) => value && typeof value === 'string').map((value) => ({
      name: `textDecoration.${convertFigmaToTextDecoration(value)}`,
      value: convertFigmaToTextDecoration(value),
      type: TokenTypes.TEXT_DECORATION,
    }));

    typography = figmaTextStyles.map((style) => {
      try {
        if (!style || !style.name) {
          console.warn('Skipping text style with missing name or style object');
          return null;
        }

        // Safe property access with fallbacks
        const styleFontFamily = style.fontName?.family || 'Unknown';
        const styleFontStyle = style.fontName?.style || 'Regular';

        const foundFamily = fontFamilies.find(
          findBoundVariable(
            style,
            'fontFamily',
            localVariables,
            (el) => el.value === styleFontFamily,
          ),
        );

        const foundFontWeight = fontWeights.find(
          findBoundVariable(
            style,
            'fontStyle',
            localVariables,
            (el) => el.name.includes(slugify(styleFontFamily)) && el.value === styleFontStyle,
          ),
        );

        let foundLineHeight;
        try {
          foundLineHeight = lineHeights.find(
            findBoundVariable(
              style,
              'lineHeight',
              localVariables,
              (el) => (style.lineHeight ? el.value === convertFigmaToLineHeight(style.lineHeight).toString() : false),
            ),
          );
        } catch (error) {
          console.warn(`Error processing lineHeight for style "${style.name}":`, error);
        }

        const foundFontSize = fontSizes.find(
          findBoundVariable(
            style,
            'fontSize',
            localVariables,
            (el) => (typeof style.fontSize === 'number' ? el.value === style.fontSize.toString() : false),
          ),
        );

        let foundLetterSpacing;
        try {
          foundLetterSpacing = letterSpacing.find(
            findBoundVariable(
              style,
              'letterSpacing',
              localVariables,
              (el) => (style.letterSpacing ? el.value === convertFigmaToLetterSpacing(style.letterSpacing).toString() : false),
            ),
          );
        } catch (error) {
          console.warn(`Error processing letterSpacing for style "${style.name}":`, error);
        }

        const foundParagraphSpacing = paragraphSpacing.find((el: StyleToCreateToken) => {
          if (style.boundVariables?.paragraphSpacing?.id) {
            const paragraphSpacingVar = localVariables.find((v) => v.id === style.boundVariables?.paragraphSpacing?.id);
            if (paragraphSpacingVar) {
              const normalizedName = paragraphSpacingVar.name.replace(/\//g, '.');
              return el.name === normalizedName;
            }
          }
          return typeof style.paragraphSpacing === 'number' ? el.value === style.paragraphSpacing.toString() : false;
        });

        const foundParagraphIndent = paragraphIndent.find(
          (el: StyleToCreateToken) => (typeof style.paragraphIndent === 'number' ? el.value === `${style.paragraphIndent.toString()}px` : false),
        );

        let foundTextCase;
        try {
          foundTextCase = textCase.find(
            (el: StyleToCreateToken) => (style.textCase && typeof style.textCase === 'string' ? el.value === convertFigmaToTextCase(style.textCase.toString()) : false),
          );
        } catch (error) {
          console.warn(`Error processing textCase for style "${style.name}":`, error);
        }

        let foundTextDecoration;
        try {
          foundTextDecoration = textDecoration.find(
            (el: StyleToCreateToken) => (style.textDecoration && typeof style.textDecoration === 'string' ? el.value === convertFigmaToTextDecoration(style.textDecoration.toString()) : false),
          );
        } catch (error) {
          console.warn(`Error processing textDecoration for style "${style.name}":`, error);
        }

        const obj = {
          fontFamily: `{${foundFamily?.name || 'fontFamilies.default'}}`,
          fontWeight: `{${foundFontWeight?.name || 'fontWeights.default'}}`,
          lineHeight: `{${foundLineHeight?.name || 'lineHeights.default'}}`,
          fontSize: `{${foundFontSize?.name || 'fontSize.default'}}`,
          letterSpacing: `{${foundLetterSpacing?.name || 'letterSpacing.default'}}`,
          paragraphSpacing: `{${foundParagraphSpacing?.name || 'paragraphSpacing.default'}}`,
          paragraphIndent: `{${foundParagraphIndent?.name || 'paragraphIndent.default'}}`,
          textCase: `{${foundTextCase?.name || 'textCase.default'}}`,
          textDecoration: `{${foundTextDecoration?.name || 'textDecoration.default'}}`,
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
      } catch (error) {
        console.warn(`Error processing typography for style "${style?.name || 'unknown'}":`, error);
        return null;
      }
    }).filter(Boolean) as StyleToCreateToken[]; // Remove null entries
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
