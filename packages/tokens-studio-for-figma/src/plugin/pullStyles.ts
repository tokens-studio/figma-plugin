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

// Helper function to get only the variables needed for a specific style
function getRelevantVariablesForStyle(style: TextStyle, allVariables: Variable[]): Variable[] {
  const relevantVariableIds = new Set<string>();

  // Extract variable IDs from bound variables
  if (style.boundVariables) {
    Object.values(style.boundVariables).forEach((boundVar: any) => {
      if (boundVar?.id) {
        relevantVariableIds.add(boundVar.id);
      }
    });
  }

  // Return only the variables needed for this style
  return allVariables.filter(v => relevantVariableIds.has(v.id));
}

// Helper function to process styles with variable references in small blocks
async function processStylesWithVariablesInBlocks<T>(
  styles: T[],
  allVariables: Variable[],
  processor: (style: T, relevantVariables: Variable[], index: number) => any,
  blockSize: number = 5, // Very small blocks for variable processing
): Promise<any[]> {
  const results: any[] = [];
  const totalBlocks = Math.ceil(styles.length / blockSize);

  console.log(`Processing ${styles.length} styles with variables in ${totalBlocks} blocks of ${blockSize}`);

  for (let i = 0; i < styles.length; i += blockSize) {
    const block = styles.slice(i, i + blockSize);
    const blockIndex = Math.floor(i / blockSize);

    console.log(`Processing variable block ${blockIndex + 1}/${totalBlocks}`);

    try {
      // Process each style in the block with only the variables it needs
      for (let j = 0; j < block.length; j++) {
        const style = block[j];
        const styleIndex = i + j;

        // Get only the variables needed for this specific style
        const relevantVariables = getRelevantVariablesForStyle(style as any, allVariables);

        const result = processor(style, relevantVariables, styleIndex);
        results.push(result);

        // Give Figma time between each style when processing variables
        if (relevantVariables.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      }

      // Clear block and give Figma more time between blocks
      block.length = 0;
      await new Promise((resolve) => setTimeout(resolve, 20));

    } catch (error) {
      console.error(`Error processing variable block ${blockIndex + 1}/${totalBlocks}:`, error);
      // Continue with next block instead of failing completely
    }
  }

  return results;
}

// Special helper for typography processing that needs all variables for token matching
async function processTypographyInBlocks(
  styles: TextStyle[],
  _allVariables: Variable[],
  processor: (style: TextStyle) => any,
  blockSize: number = 2, // Very small blocks for typography
): Promise<any[]> {
  const results: any[] = [];
  const totalBlocks = Math.ceil(styles.length / blockSize);

  console.log(`Processing ${styles.length} typography styles in ${totalBlocks} blocks of ${blockSize}`);

  for (let i = 0; i < styles.length; i += blockSize) {
    const block = styles.slice(i, i + blockSize);
    const blockIndex = Math.floor(i / blockSize);

    console.log(`Processing typography block ${blockIndex + 1}/${totalBlocks}`);

    try {
      // Process each style in the block
      for (let j = 0; j < block.length; j++) {
        const style = block[j];

        const result = processor(style);
        results.push(result);

        // Give Figma time between each typography style (they're complex)
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Clear block and give Figma more time between blocks
      block.length = 0;
      await new Promise((resolve) => setTimeout(resolve, 30));

    } catch (error) {
      console.error(`Error processing typography block ${blockIndex + 1}/${totalBlocks}:`, error);
      // Continue with next block instead of failing completely
    }
  }

  return results;
}

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

    // Process font sizes with block-based variable handling to prevent memory leaks
    fontSizes = await processStylesWithVariablesInBlocks(
      figmaTextStyles,
      localVariables,
      (style, relevantVariables, idx) => processTextStyleProperty(
        style,
        'fontSize',
        relevantVariables, // Only pass variables needed for this style
        tokens,
        TokenTypes.FONT_SIZES,
        'fontSize',
        idx,
        (value) => value.toString(),
      ),
    );

    const uniqueFontCombinations = fontCombinations.filter(
      (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i,
    );

    // Process line heights with block-based variable handling
    lineHeights = await processStylesWithVariablesInBlocks(
      figmaTextStyles,
      localVariables,
      (style, relevantVariables, idx) => processTextStyleProperty(
        style,
        'lineHeight',
        relevantVariables, // Only pass variables needed for this style
        tokens,
        TokenTypes.LINE_HEIGHTS,
        'lineHeights',
        idx,
        (value) => convertFigmaToLineHeight(value).toString(),
      ),
    );

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

      // Use block-based processing for font weights with variables
      const relevantVariables = getRelevantVariablesForStyle(matchingStyle, localVariables);
      return processTextStyleProperty(
        matchingStyle,
        'fontStyle',
        relevantVariables, // Only pass variables needed for this style
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

      // Use block-based processing for font families with variables
      const relevantVariables = getRelevantVariablesForStyle(matchingStyle, localVariables);
      return processTextStyleProperty(
        matchingStyle,
        'fontFamily',
        relevantVariables, // Only pass variables needed for this style
        tokens,
        TokenTypes.FONT_FAMILIES,
        `fontFamilies.${slugify(fontFamily)}`,
        idx,
        () => fontFamily,
      );
    });

    // Process paragraph spacing with block-based variable handling
    paragraphSpacing = await processStylesWithVariablesInBlocks(
      figmaTextStyles,
      localVariables,
      (style, relevantVariables, idx) => processTextStyleProperty(
        style,
        'paragraphSpacing',
        relevantVariables, // Only pass variables needed for this style
        tokens,
        TokenTypes.PARAGRAPH_SPACING,
        'paragraphSpacing',
        idx,
        (value) => value.toString(),
      ),
    );

    paragraphIndent = rawParagraphIndent
      .sort((a, b) => a - b)
      .map((size, idx) => ({
        name: `paragraphIndent.${idx}`,
        value: `${size.toString()}px`,
        type: TokenTypes.DIMENSION,
      }));

    // Process letter spacing with block-based variable handling
    letterSpacing = await processStylesWithVariablesInBlocks(
      figmaTextStyles,
      localVariables,
      (style, relevantVariables, idx) => processTextStyleProperty(
        style,
        'letterSpacing',
        relevantVariables, // Only pass variables needed for this style
        tokens,
        TokenTypes.LETTER_SPACING,
        'letterSpacing',
        idx,
        (value) => convertFigmaToLetterSpacing(value).toString(),
      ),
    );

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

    // Process typography with special block processing that preserves all variables for token matching
    typography = await processTypographyInBlocks(
      figmaTextStyles,
      localVariables,
      (style) => {
        // Find the generated tokens for this style
        // The tokens were created either with variable references or raw values
        const foundFamily = fontFamilies.find((el) => {
          // If style has bound variable, look for token with variable name
          if (style.boundVariables?.fontFamily?.id) {
            const boundVar = localVariables.find((v) => v.id === style.boundVariables?.fontFamily?.id);
            if (boundVar) {
              const normalizedName = boundVar.name.replace(/\//g, '.');
              return el.name === normalizedName;
            }
          }
          // Otherwise, look for token with matching value
          return el.value === style.fontName.family;
        });

        const foundFontWeight = fontWeights.find((el) => {
          // If style has bound variable, look for token with variable name
          if (style.boundVariables?.fontStyle?.id) {
            const boundVar = localVariables.find((v) => v.id === style.boundVariables?.fontStyle?.id);
            if (boundVar) {
              const normalizedName = boundVar.name.replace(/\//g, '.');
              return el.name === normalizedName;
            }
          }
          // Otherwise, look for token with matching value and family
          return el.name.includes(slugify(style.fontName.family)) && el.value === style.fontName?.style;
        });

        const foundLineHeight = lineHeights.find((el) => {
          // If style has bound variable, look for token with variable name
          if (style.boundVariables?.lineHeight?.id) {
            const boundVar = localVariables.find((v) => v.id === style.boundVariables?.lineHeight?.id);
            if (boundVar) {
              const normalizedName = boundVar.name.replace(/\//g, '.');
              return el.name === normalizedName;
            }
          }
          // Otherwise, look for token with matching value
          return el.value === convertFigmaToLineHeight(style.lineHeight).toString();
        });

        const foundFontSize = fontSizes.find((el) => {
          // If style has bound variable, look for token with variable name
          if (style.boundVariables?.fontSize?.id) {
            const boundVar = localVariables.find((v) => v.id === style.boundVariables?.fontSize?.id);
            if (boundVar) {
              const normalizedName = boundVar.name.replace(/\//g, '.');
              return el.name === normalizedName;
            }
          }
          // Otherwise, look for token with matching value
          return el.value === style.fontSize.toString();
        });

        const foundLetterSpacing = letterSpacing.find((el) => {
          // If style has bound variable, look for token with variable name
          if (style.boundVariables?.letterSpacing?.id) {
            const boundVar = localVariables.find((v) => v.id === style.boundVariables?.letterSpacing?.id);
            if (boundVar) {
              const normalizedName = boundVar.name.replace(/\//g, '.');
              return el.name === normalizedName;
            }
          }
          // Otherwise, look for token with matching value
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
      },
    );
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
