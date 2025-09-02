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
      if (!rawFontSizes.includes(style.fontSize)) rawFontSizes.push(style.fontSize);
      fontCombinations.push(style.fontName);
      rawLineHeights.push(style.lineHeight);
      if (!rawParagraphSpacing.includes(style.paragraphSpacing)) rawParagraphSpacing.push(style.paragraphSpacing);
      if (!rawParagraphIndent.includes(style.paragraphIndent)) rawParagraphIndent.push(style.paragraphIndent);
      rawLetterSpacing.push(style.letterSpacing);
      if (!rawTextCase.includes(style.textCase)) rawTextCase.push(style.textCase);
      if (!rawTextDecoration.includes(style.textDecoration)) rawTextDecoration.push(style.textDecoration);
    });

    fontSizes = figmaTextStyles.map((style, idx) => processTextStyleProperty(
      style,
      'fontSize',
      localVariables,
      tokens,
      TokenTypes.FONT_SIZES,
      'fontSize',
      idx,
      (value) => value.toString(),
    ));

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
      (value) => convertFigmaToLineHeight(value).toString(),
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

    paragraphSpacing = figmaTextStyles.map((style, idx) => processTextStyleProperty(
      style,
      'paragraphSpacing',
      localVariables,
      tokens,
      TokenTypes.PARAGRAPH_SPACING,
      'paragraphSpacing',
      idx,
      (value) => value.toString(),
    ));

    paragraphIndent = rawParagraphIndent
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphIndent.${idx}`,
        value: `${size.toString()}px`,
        type: TokenTypes.DIMENSION,
      }));

    letterSpacing = figmaTextStyles.map((style, idx) => processTextStyleProperty(
      style,
      'letterSpacing',
      localVariables,
      tokens,
      TokenTypes.LETTER_SPACING,
      'letterSpacing',
      idx,
      (value) => convertFigmaToLetterSpacing(value).toString(),
    ));

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
      const foundFamily = fontFamilies.find(
        findBoundVariable(
          style,
          'fontFamily',
          localVariables,
          (el) => el.value === style.fontName.family,
        ),
      );

      const foundFontWeight = fontWeights.find(
        findBoundVariable(
          style,
          'fontStyle',
          localVariables,
          (el) => el.name.includes(slugify(style.fontName.family)) && el.value === style.fontName?.style,
        ),
      );

      const foundLineHeight = lineHeights.find(
        findBoundVariable(
          style,
          'lineHeight',
          localVariables,
          (el) => el.value === convertFigmaToLineHeight(style.lineHeight).toString(),
        ),
      );
      const foundFontSize = fontSizes.find(
        findBoundVariable(
          style,
          'fontSize',
          localVariables,
          (el) => el.value === style.fontSize.toString(),
        ),
      );
      const foundLetterSpacing = letterSpacing.find(
        findBoundVariable(
          style,
          'letterSpacing',
          localVariables,
          (el) => el.value === convertFigmaToLetterSpacing(style.letterSpacing).toString(),
        ),
      );
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
