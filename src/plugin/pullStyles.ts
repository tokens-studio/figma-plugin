/* eslint-disable no-param-reassign */
import { figmaRGBToHex } from '@figma-plugin/helpers';
import {
  SingleToken, SingleBoxShadowToken, SingleColorToken,
} from '@/types/tokens';
import { ColorToken, ShadowTokenSingleValue } from '@/types/propertyTypes';
import { convertBoxShadowTypeFromFigma } from './figmaTransforms/boxShadow';
import { convertFigmaGradientToString } from './figmaTransforms/gradients';
import { convertFigmaToLetterSpacing } from './figmaTransforms/letterSpacing';
import { convertFigmaToLineHeight } from './figmaTransforms/lineHeight';
import { convertFigmaToTextCase } from './figmaTransforms/textCase';
import { convertFigmaToTextDecoration } from './figmaTransforms/textDecoration';
import { notifyStyleValues } from './notifiers';
import { PullStyleOptions } from '@/types';
import { slugify } from '@/utils/string';

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
  let textCase: SingleToken[] = [];
  let textDecoration: SingleToken[] = [];
  if (styleTypes.colorStyles) {
    colors = figma
      .getLocalPaintStyles()
      .filter((style) => style.paints.length === 1)
      .map((style) => {
        const paint = style.paints[0];
        let styleObject: SingleColorToken = {} as SingleColorToken;
        if (style.description) {
          styleObject.description = style.description;
        }
        if (paint.type === 'SOLID') {
          const { r, g, b } = paint.color;
          const a = paint.opacity;
          styleObject.value = figmaRGBToHex({
            r, g, b, a,
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
            name: normalizedName,
            type: 'color',
            ...styleObject,
          }
          : null;
      })
      .filter(Boolean);
  }

  if (styleTypes.textStyles) {
    const rawFontSizes = [];
    const fontCombinations = [];
    const rawLineHeights = [];
    const rawParagraphSpacing = [];
    const rawLetterSpacing = [];
    const rawTextCase = [];
    const rawTextDecoration = [];

    const figmaTextStyles = figma.getLocalTextStyles();

    figmaTextStyles.map((style) => {
      if (!rawFontSizes.includes(style.fontSize)) rawFontSizes.push(style.fontSize);
      fontCombinations.push(style.fontName);
      rawLineHeights.push(style.lineHeight);
      if (!rawParagraphSpacing.includes(style.paragraphSpacing)) rawParagraphSpacing.push(style.paragraphSpacing);
      rawLetterSpacing.push(style.letterSpacing);
      if (!rawTextCase.includes(style.textCase)) rawTextCase.push(style.textCase);
      if (!rawTextDecoration.includes(style.textDecoration)) rawTextDecoration.push(style.textDecoration);
    });

    fontSizes = rawFontSizes
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `fontSize.${idx}`,
        value: size.toString(),
        type: 'fontSizes',
      }));

    const uniqueFontCombinations = fontCombinations.filter(
      (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i,
    );
    lineHeights = rawLineHeights
      .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
      .map((lh, idx) => ({
        name: `lineHeights.${idx}`,
        value: convertFigmaToLineHeight(lh).toString(),
        type: 'lineHeights',
      }));

    fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((fontFamily) => ({
      name: `fontFamilies.${slugify(fontFamily)}`,
      value: fontFamily,
      type: 'fontFamilies',
    }));

    fontWeights = uniqueFontCombinations.map((font, idx) => ({
      name: `fontWeights.${slugify(font.family)}-${idx}`,
      value: font.style,
      type: 'fontWeights',
    }));

    paragraphSpacing = rawParagraphSpacing
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphSpacing.${idx}`,
        value: size.toString(),
        type: 'paragraphSpacing',
      }));

    letterSpacing = rawLetterSpacing
      .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
      .map((lh, idx) => ({
        name: `letterSpacing.${idx}`,
        value: convertFigmaToLetterSpacing(lh).toString(),
        type: 'letterSpacing',
      }));

    textCase = rawTextCase.map((value) => ({
      name: `textCase.${convertFigmaToTextCase(value)}`,
      value: convertFigmaToTextCase(value),
      type: 'textCase',
    }));

    textDecoration = rawTextDecoration.map((value) => ({
      name: `textDecoration.${convertFigmaToTextDecoration(value)}`,
      value: convertFigmaToTextDecoration(value),
      type: 'textDecoration',
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
      const foundTextCase = textCase.find(
        (el: SingleToken) => el.value === convertFigmaToTextCase(style.textCase.toString()),
      );
      const foundTextDecoration = textDecoration.find(
        (el: SingleToken) => el.value === convertFigmaToTextDecoration(style.textDecoration.toString()),
      );

      const obj = {
        fontFamily: `$${foundFamily?.name}`,
        fontWeight: `$${foundFontWeight?.name}`,
        lineHeight: `$${foundLineHeight?.name}`,
        fontSize: `$${foundFontSize?.name}`,
        letterSpacing: `$${foundLetterSpacing?.name}`,
        paragraphSpacing: `$${foundParagraphSpacing?.name}`,
        textCase: `$${foundTextCase?.name}`,
        textDecoration: `$${foundTextDecoration?.name}`,
      };

      const normalizedName = style.name
        .split('/')
        .map((section) => section.trim())
        .join('.');

      const styleObject: SingleToken = { name: normalizedName, value: obj, type: 'typography' };

      if (style.description) {
        styleObject.description = style.description;
      }

      return styleObject;
    });
  }

  if (styleTypes.effectStyles) {
    effects = figma
      .getLocalEffectStyles()
      .filter((style) => style.effects.every((effect) => ['DROP_SHADOW', 'INNER_SHADOW'].includes(effect.type)))
      .map((style) => {
        // convert paint to object containg x, y, spread, color
        const shadows: SingleBoxShadowToken['value'][] = style.effects.map((effect) => {
          const effectObject: SingleBoxShadowToken['value'] = {} as SingleBoxShadowToken['value'];

          effectObject.color = figmaRGBToHex(effect.color);
          effectObject.type = convertBoxShadowTypeFromFigma(effect.type);
          effectObject.x = effect.offset.x;
          effectObject.y = effect.offset.y;
          effectObject.blur = effect.radius;
          effectObject.spread = effect.spread;

          return effectObject;
        });

        if (!shadows) return null;

        const normalizedName = style.name
          .split('/')
          .map((section) => section.trim())
          .join('.');

        const styleObject: SingleToken = {
          value: shadows.length > 1 ? shadows : shadows[0],
          type: 'boxShadow',
          name: normalizedName,
        };
        if (style.description) {
          styleObject.description = style.description;
        }

        return styleObject;
      })
      .filter(Boolean);
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
  };

  const returnedObject = Object.entries(stylesObject).reduce((acc, [key, value]) => {
    if (value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {});

  notifyStyleValues(returnedObject);
}
