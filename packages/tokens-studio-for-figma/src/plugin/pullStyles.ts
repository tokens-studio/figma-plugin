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
import { findOrCreateToken } from '@/utils/findOrCreateToken';

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
      if (!rawFontSizes.includes(style.fontSize)) rawFontSizes.push(style.fontSize);
      fontCombinations.push(style.fontName);
      rawLineHeights.push(style.lineHeight);
      if (!rawParagraphSpacing.includes(style.paragraphSpacing)) rawParagraphSpacing.push(style.paragraphSpacing);
      if (!rawParagraphIndent.includes(style.paragraphIndent)) rawParagraphIndent.push(style.paragraphIndent);
      rawLetterSpacing.push(style.letterSpacing);
      if (!rawTextCase.includes(style.textCase)) rawTextCase.push(style.textCase);
      if (!rawTextDecoration.includes(style.textDecoration)) rawTextDecoration.push(style.textDecoration);
    });

    fontSizes = rawFontSizes
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `fontSize.${idx}`,
        value: size,
        type: TokenTypes.FONT_SIZES,
      }));

    const uniqueFontCombinations = fontCombinations.filter(
      (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i,
    );

    lineHeights = figmaTextStyles.map((style, idx) => processTextStyleProperty(
      style,
      'lineHeight',
      localVariables,
      tokens,
      TokenTypes.LINE_HEIGHTS,
      'lineHeights',
      idx,
      (value) => convertFigmaToLineHeight(value),
    ));

    fontWeights = uniqueFontCombinations.map((font, idx) => {
      const matchingStyle = figmaTextStyles.find((style) => style.fontName.family === font.family
 && style.fontName.style === font.style);

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
    });

    fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((fontFamily, idx) => {
      const matchingStyle = figmaTextStyles.find((style) => style.fontName.family === fontFamily);

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
    });

    paragraphSpacing = rawParagraphSpacing
      .sort((a, b) => a - b)
      .map((spacing, idx) => ({
        name: `paragraphSpacing.${idx}`,
        value: spacing,
        type: TokenTypes.PARAGRAPH_SPACING,
      }));

    paragraphIndent = rawParagraphIndent
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphIndent.${idx}`,
        value: `${size}px`, // DIMENSION type requires units
        type: TokenTypes.DIMENSION,
      }));

    letterSpacing = rawLetterSpacing
      .map((spacing) => convertFigmaToLetterSpacing(spacing))
      .filter((value, index, array) => array.findIndex((v) => String(v) === String(value)) === index)
      .map((value, idx) => ({
        name: `letterSpacing.${idx}`,
        value,
        type: TokenTypes.LETTER_SPACING,
      }));

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
      // Extract style values once to avoid repetition
      const fontFamily = style.fontName.family;
      const fontWeight = style.fontName.style;
      const lineHeightValue = convertFigmaToLineHeight(style.lineHeight);
      const letterSpacingValue = convertFigmaToLetterSpacing(style.letterSpacing);
      const paragraphIndentValue = `${style.paragraphIndent}px`; // DIMENSION type requires units
      const textCaseValue = convertFigmaToTextCase(style.textCase);
      const textDecorationValue = convertFigmaToTextDecoration(style.textDecoration);

      // Extract numeric values for typography object
      const lineHeightNumeric = typeof lineHeightValue === 'number' ? lineHeightValue : lineHeightValue;
      const fontSizeNumeric = typeof style.fontSize === 'number' ? style.fontSize : style.fontSize;
      const letterSpacingNumeric = typeof letterSpacingValue === 'number' ? letterSpacingValue : letterSpacingValue;
      const paragraphSpacingNumeric = typeof style.paragraphSpacing === 'number' ? style.paragraphSpacing : style.paragraphSpacing;
      const paragraphIndentNumeric = typeof style.paragraphIndent === 'number' ? style.paragraphIndent : paragraphIndentValue;

      const foundFamily = findOrCreateToken(style, 'fontFamily', fontFamily, fontFamilies, TokenTypes.FONT_FAMILIES, localVariables);

      // Font weights need special handling since multiple fonts can have the same weight value
      // We need to match by both font family name and weight value
      let foundFontWeight: StyleToCreateToken | undefined;
      const boundVariables = style.boundVariables as Record<string, { id: string; } | undefined>;

      if (boundVariables?.fontStyle?.id) {
        const variable = localVariables.find((v) => v.id === boundVariables.fontStyle?.id);
        if (variable) {
          const normalizedName = variable.name.replace(/\//g, '.');
          foundFontWeight = fontWeights.find((token) => token.name === normalizedName);
        }
      }

      if (!foundFontWeight) {
        // Match by font family name AND weight value
        foundFontWeight = fontWeights.find((token) => token.name.includes(slugify(fontFamily))
          && String(token.value) === String(fontWeight));
      }
      const foundLineHeight = findOrCreateToken(style, 'lineHeight', lineHeightValue, lineHeights, TokenTypes.LINE_HEIGHTS, localVariables);
      const foundFontSize = findOrCreateToken(style, 'fontSize', style.fontSize, fontSizes, TokenTypes.FONT_SIZES, localVariables);
      const foundLetterSpacing = findOrCreateToken(style, 'letterSpacing', letterSpacingValue, letterSpacing, TokenTypes.LETTER_SPACING, localVariables);
      const foundParagraphSpacing = findOrCreateToken(style, 'paragraphSpacing', style.paragraphSpacing, paragraphSpacing, TokenTypes.PARAGRAPH_SPACING, localVariables);
      const foundParagraphIndent = findOrCreateToken(style, 'paragraphIndent', paragraphIndentValue, paragraphIndent, TokenTypes.DIMENSION, localVariables);
      const foundTextCase = findOrCreateToken(style, 'textCase', textCaseValue, textCase, TokenTypes.TEXT_CASE, localVariables);
      const foundTextDecoration = findOrCreateToken(style, 'textDecoration', textDecorationValue, textDecoration, TokenTypes.TEXT_DECORATION, localVariables);

      const obj = {
        fontFamily: foundFamily?.name ? `{${foundFamily.name}}` : fontFamily,
        fontWeight: foundFontWeight?.name ? `{${foundFontWeight.name}}` : fontWeight,
        lineHeight: foundLineHeight?.name ? `{${foundLineHeight.name}}` : lineHeightNumeric,
        fontSize: foundFontSize?.name ? `{${foundFontSize.name}}` : fontSizeNumeric,
        letterSpacing: foundLetterSpacing?.name ? `{${foundLetterSpacing.name}}` : letterSpacingNumeric,
        paragraphSpacing: foundParagraphSpacing?.name ? `{${foundParagraphSpacing.name}}` : paragraphSpacingNumeric,
        paragraphIndent: foundParagraphIndent?.name ? `{${foundParagraphIndent.name}}` : paragraphIndentNumeric,
        textCase: foundTextCase?.name ? `{${foundTextCase.name}}` : textCaseValue,
        textDecoration: foundTextDecoration?.name ? `{${foundTextDecoration.name}}` : textDecorationValue,
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
