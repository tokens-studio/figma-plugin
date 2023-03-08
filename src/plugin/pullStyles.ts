/* eslint-disable no-param-reassign */
import compact from 'just-compact';
import { figmaRGBToHex } from '@figma-plugin/helpers';
import { SingleToken, SingleColorToken, AnyTokenList } from '@/types/tokens';
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

export default function pullStyles(styleTypes: PullStyleOptions): void {
  // @TODO should be specifically typed according to their type
  let colors: SingleToken[] = [];
  let typography: SingleToken[] = [];
  let effects: SingleToken[] = [];
  let fontFamilies: SingleToken[] = [];
  let lineHeights: SingleToken[] = [];
  let fontWeights: SingleToken[] = [];
  let fontSizes: SingleToken[] = [];
  let letterSpacing: SingleToken[] = [];
  let paragraphSpacing: SingleToken[] = [];
  let paragraphIndent: any[] = [];
  let textCase: SingleToken[] = [];
  let textDecoration: SingleToken[] = [];
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
        value: size.toString(),
        type: TokenTypes.FONT_SIZES,
      }));

    const uniqueFontCombinations = fontCombinations.filter(
      (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i,
    );
    lineHeights = rawLineHeights
      .filter(
        (v, i, a) => a.findIndex((t) => t.unit === v.unit && ('value' in t && 'value' in v ? t.value === v.value : true)) === i,
      )
      .map((lh, idx) => ({
        name: `lineHeights.${idx}`,
        value: convertFigmaToLineHeight(lh).toString(),
        type: TokenTypes.LINE_HEIGHTS,
      }));

    fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((fontFamily) => ({
      name: `fontFamilies.${slugify(fontFamily)}`,
      value: fontFamily,
      type: TokenTypes.FONT_FAMILIES,
    }));

    fontWeights = uniqueFontCombinations.map((font, idx) => ({
      name: `fontWeights.${slugify(font.family)}-${idx}`,
      value: font.style,
      type: TokenTypes.FONT_WEIGHTS,
    }));
    paragraphSpacing = rawParagraphSpacing
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphSpacing.${idx}`,
        value: size.toString(),
        type: TokenTypes.PARAGRAPH_SPACING,
      }));

    paragraphIndent = rawParagraphIndent
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphIndent.${idx}`,
        value: `${size.toString()}px`,
        type: TokenTypes.DIMENSION,
      }));

    letterSpacing = rawLetterSpacing
      .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
      .map((lh, idx) => ({
        name: `letterSpacing.${idx}`,
        value: convertFigmaToLetterSpacing(lh).toString(),
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
      const foundFamily = fontFamilies.find((el: SingleToken) => el.value === style.fontName.family);
      const foundFontWeight = fontWeights.find(
        (el: SingleToken) => el.name.includes(slugify(style.fontName.family)) && el.value === style.fontName?.style,
      );
      const foundLineHeight = lineHeights.find(
        (el: SingleToken) => el.value === convertFigmaToLineHeight(style.lineHeight).toString(),
      );
      const foundFontSize = fontSizes.find((el: SingleToken) => el.value === style.fontSize.toString());
      const foundLetterSpacing = letterSpacing.find(
        (el: SingleToken) => el.value === convertFigmaToLetterSpacing(style.letterSpacing).toString(),
      );
      const foundParagraphSpacing = paragraphSpacing.find(
        (el: SingleToken) => el.value === style.paragraphSpacing.toString(),
      );
      const foundParagraphIndent = paragraphIndent.find(
        (el: SingleToken) => el.value === `${style.paragraphIndent.toString()}px`,
      );
      const foundTextCase = textCase.find(
        (el: SingleToken) => el.value === convertFigmaToTextCase(style.textCase.toString()),
      );
      const foundTextDecoration = textDecoration.find(
        (el: SingleToken) => el.value === convertFigmaToTextDecoration(style.textDecoration.toString()),
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

      const styleObject: SingleToken = { name: normalizedName, value: obj, type: TokenTypes.TYPOGRAPHY };

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
          const effects = style.effects as DropShadowEffect[];
          // convert paint to object containg x, y, spread, color
          const shadows: TokenBoxshadowValue[] = effects.map((effect) => {
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

          const styleObject: SingleToken = {
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

  type ResultObject = Record<string, AnyTokenList>;

  const returnedObject = Object.entries(stylesObject).reduce<ResultObject>((acc, [key, value]) => {
    if (value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {});

  notifyStyleValues(returnedObject);
}
