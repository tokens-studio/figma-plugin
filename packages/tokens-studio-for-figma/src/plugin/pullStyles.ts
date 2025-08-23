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
    const figmaTextStyles = figma.getLocalTextStyles();
    const localVariables = await getVariablesWithoutZombies();

    const variableMap = new Map<string, Variable>();
    localVariables.forEach((variable) => {
      variableMap.set(variable.id, variable);
    });

    const fontSizeSet = new Set<number>();
    const paragraphSpacingSet = new Set<number>();
    const paragraphIndentSet = new Set<number>();
    const textCaseSet = new Set<TextCase>();
    const textDecorationSet = new Set<TextDecoration>();

    const fontCombinations: FontName[] = [];
    const rawLineHeights: LineHeight[] = [];
    const rawLetterSpacing: LetterSpacing[] = [];

    figmaTextStyles.forEach((style) => {
      fontSizeSet.add(style.fontSize);
      fontCombinations.push(style.fontName);
      rawLineHeights.push(style.lineHeight);
      paragraphSpacingSet.add(style.paragraphSpacing);
      paragraphIndentSet.add(style.paragraphIndent);
      rawLetterSpacing.push(style.letterSpacing);
      textCaseSet.add(style.textCase);
      textDecorationSet.add(style.textDecoration);
    });

    // Convert sets back to arrays only when needed
    const rawFontSizes = Array.from(fontSizeSet);
    const rawParagraphSpacing = Array.from(paragraphSpacingSet);
    const rawParagraphIndent = Array.from(paragraphIndentSet);
    const rawTextCase = Array.from(textCaseSet);
    const rawTextDecoration = Array.from(textDecorationSet);

    fontSizes = figmaTextStyles.map((style, idx) => processTextStyleProperty(
      style,
      'fontSize',
      variableMap,
      tokens,
      TokenTypes.FONT_SIZES,
      'fontSize',
      idx,
      (value) => value.toString(),
    ));

    // Use Map for O(1) uniqueness check instead of O(n²) filter operation
    const fontCombinationMap = new Map<string, FontName>();
    fontCombinations.forEach((font) => {
      const key = `${font.family}-${font.style}`;
      fontCombinationMap.set(key, font);
    });
    const uniqueFontCombinations = Array.from(fontCombinationMap.values());

    lineHeights = figmaTextStyles.map((style, idx) => processTextStyleProperty(
      style,
      'lineHeight',
      variableMap,
      tokens,
      TokenTypes.LINE_HEIGHTS,
      'lineHeights',
      idx,
      (value) => convertFigmaToLineHeight(value).toString(),
    ));

    // Create style lookup map for O(1) access instead of repeated find operations
    const styleByFontMap = new Map<string, TextStyle>();
    figmaTextStyles.forEach((style) => {
      const key = `${style.fontName.family}-${style.fontName.style}`;
      styleByFontMap.set(key, style);
    });

    fontWeights = uniqueFontCombinations.map((font, idx) => {
      const key = `${font.family}-${font.style}`;
      const matchingStyle = styleByFontMap.get(key);

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
        variableMap,
        tokens,
        TokenTypes.FONT_WEIGHTS,
        `fontWeights.${slugify(font.family)}`,
        idx,
        () => font.style,
      );
    });

    // Create family lookup map for O(1) access
    const styleByFamilyMap = new Map<string, TextStyle>();
    figmaTextStyles.forEach((style) => {
      if (!styleByFamilyMap.has(style.fontName.family)) {
        styleByFamilyMap.set(style.fontName.family, style);
      }
    });

    const uniqueFontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))];
    fontFamilies = uniqueFontFamilies.map((fontFamily, idx) => {
      const matchingStyle = styleByFamilyMap.get(fontFamily);

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
        variableMap,
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
      variableMap,
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
      variableMap,
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
      // For variable references, prioritize finding by variable name, otherwise use value lookup
      const foundFamily = fontFamilies.find(
        findBoundVariable(
          style,
          'fontFamily',
          variableMap,
          (el) => el.value === style.fontName.family,
        ),
      );

      const foundFontWeight = fontWeights.find(
        findBoundVariable(
          style,
          'fontStyle',
          variableMap,
          (el) => el.name.includes(slugify(style.fontName.family)) && el.value === style.fontName?.style,
        ),
      );

      const foundLineHeight = lineHeights.find(
        findBoundVariable(
          style,
          'lineHeight',
          variableMap,
          (el) => el.value === convertFigmaToLineHeight(style.lineHeight).toString(),
        ),
      );

      const foundFontSize = fontSizes.find(
        findBoundVariable(
          style,
          'fontSize',
          variableMap,
          (el) => el.value === style.fontSize.toString(),
        ),
      );

      const foundLetterSpacing = letterSpacing.find(
        findBoundVariable(
          style,
          'letterSpacing',
          variableMap,
          (el) => el.value === convertFigmaToLetterSpacing(style.letterSpacing).toString(),
        ),
      );

      const foundParagraphSpacing = paragraphSpacing.find((el: StyleToCreateToken) => {
        if (style.boundVariables?.paragraphSpacing?.id) {
          const paragraphSpacingVar = variableMap.get(style.boundVariables.paragraphSpacing.id);
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
