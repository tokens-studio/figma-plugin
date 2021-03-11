/* eslint-disable no-param-reassign */
import {figmaRGBToHex} from '@figma-plugin/helpers';
import {ColorToken, TypographyToken} from '../../types/propertyTypes';
import {isTypographyToken, isValueToken, slugify} from '../app/components/utils';
import {
    convertFigmaGradientToString,
    convertFigmaToLetterSpacing,
    convertFigmaToLineHeight,
    convertLetterSpacingToFigma,
    convertLineHeightToFigma,
    convertStringToFigmaGradient,
    convertToFigmaColor,
} from './helpers';
import {notifyStyleValues} from './notifiers';

export const setTextValuesOnTarget = async (target, token) => {
    const {fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, paragraphSpacing, description} = token;
    const family = fontFamily || target.fontName.family;
    const style = fontWeight || target.fontName.style;
    await figma.loadFontAsync({family, style});

    if (fontFamily && fontWeight) {
        target.fontName = {
            family,
            style,
        };
    }

    if (fontSize) {
        target.fontSize = Number(fontSize);
    }
    if (lineHeight) {
        target.lineHeight = convertLineHeightToFigma(lineHeight);
    }
    if (letterSpacing) {
        target.letterSpacing = convertLetterSpacingToFigma(letterSpacing);
    }
    if (paragraphSpacing) {
        target.paragraphSpacing = Number(paragraphSpacing);
    }
    if (description) {
        target.description = description;
    }
};

const setColorValuesOnTarget = (target, token) => {
    const {description, value} = token;
    if (value.startsWith('linear-gradient')) {
        const gradientStops = convertStringToFigmaGradient(value);
        const oldPaint = target.paints[0];
        const newPaint = {
            type: 'GRADIENT_LINEAR',
            gradientTransform: oldPaint?.gradientTransform || [
                [1, 0, 0],
                [0, 1, 0],
            ],
            gradientStops,
        };
        target.paints = [newPaint];
    } else {
        const {color, opacity} = convertToFigmaColor(value);
        target.paints = [{color, opacity, type: 'SOLID'}];
    }

    if (description) {
        target.description = description;
    }
};

const checkForTokens = (obj, token, root = null) => {
    let returnValue;
    if (isValueToken(token) || isTypographyToken(token)) {
        returnValue = token;
    } else if (typeof token === 'object') {
        Object.entries(token).map(([key, value]) => {
            const [, result] = checkForTokens(obj, value, [root, key].filter((n) => n).join('/'));
            if (root && result) {
                obj[[root, key].join('/')] = result;
            } else if (result) {
                obj[key] = result;
            }
        });
    } else {
        returnValue = {
            value: token,
        };
    }
    return [obj, returnValue];
};

const convertToTokenArray = (tokens) => {
    const [result] = checkForTokens({}, tokens);
    return Object.entries(result);
};

const updateColorStyles = (colorTokens, shouldCreate = false) => {
    // Iterate over colorTokens to create objects that match figma styles
    const colorTokenArray = convertToTokenArray(colorTokens);
    const paints = figma.getLocalPaintStyles();

    colorTokenArray.map(([key, value]: [string, ColorToken]) => {
        let matchingStyles = [];
        if (paints.length > 0) {
            matchingStyles = paints.filter((n) => n.name === key);
        }
        if (matchingStyles.length) {
            setColorValuesOnTarget(matchingStyles[0], value);
        } else if (shouldCreate) {
            const style = figma.createPaintStyle();
            style.name = key;
            setColorValuesOnTarget(style, value);
        }
    });
};

const updateTextStyles = (textTokens, shouldCreate = false) => {
    // Iterate over textTokens to create objects that match figma styles
    const textTokenArray = convertToTokenArray(textTokens);
    const textStyles = figma.getLocalTextStyles();

    textTokenArray.map(([key, value]: [string, TypographyToken]) => {
        let matchingStyles = [];
        if (textStyles.length > 0) {
            matchingStyles = textStyles.filter((n) => n.name === key);
        }

        if (matchingStyles.length) {
            setTextValuesOnTarget(matchingStyles[0], value);
        } else if (shouldCreate) {
            const style = figma.createTextStyle();
            style.name = key;
            setTextValuesOnTarget(style, value);
        }
    });
};

export function updateStyles(tokens, shouldCreate = false): void {
    if (!tokens.colors && !tokens.typography) return;
    if (tokens.colors) {
        updateColorStyles(tokens.colors, shouldCreate);
    }
    if (tokens.typography) {
        updateTextStyles(tokens.typography, shouldCreate);
    }
}

export function pullStyles(styleTypes): void {
    let colors;
    let typography;
    let fontFamilies;
    let lineHeights;
    let fontWeights;
    let fontSizes;
    let letterSpacing;
    let paragraphSpacing;
    if (styleTypes.colorStyles) {
        colors = figma
            .getLocalPaintStyles()
            .filter((style) => style.paints.length === 1)
            .map((style) => {
                const paint = style.paints[0];
                let styleObject: ColorToken = {};
                if (style.description) {
                    styleObject.description = style.description;
                }
                if (paint.type === 'SOLID') {
                    const {r, g, b} = paint.color;
                    const a = paint.opacity;
                    styleObject.value = figmaRGBToHex({r, g, b, a});
                } else if (paint.type === 'GRADIENT_LINEAR') {
                    styleObject.value = convertFigmaGradientToString(paint);
                } else {
                    styleObject = null;
                }
                return styleObject ? [style.name, styleObject] : null;
            })
            .filter(Boolean);
    }
    if (styleTypes.textStyles) {
        const rawFontSizes = [];
        const fontCombinations = [];
        const rawLineHeights = [];
        const rawParagraphSpacing = [];
        const rawLetterSpacing = [];

        const figmaTextStyles = figma.getLocalTextStyles();
        figmaTextStyles.map((style) => {
            if (!rawFontSizes.includes(style.fontSize)) rawFontSizes.push(style.fontSize);
            fontCombinations.push(style.fontName);
            rawLineHeights.push(style.lineHeight);
            if (!rawParagraphSpacing.includes(style.paragraphSpacing)) rawParagraphSpacing.push(style.paragraphSpacing);
            rawLetterSpacing.push(style.letterSpacing);
        });

        fontSizes = rawFontSizes.sort((a, b) => a - b).map((size, idx) => [idx, size]);
        const uniqueFontCombinations = fontCombinations.filter(
            (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i
        );

        lineHeights = rawLineHeights
            .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
            .map((lh, idx) => [idx, convertFigmaToLineHeight(lh)]);

        fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((fontFamily) => [
            `font-${slugify(fontFamily)}`,
            fontFamily,
        ]);

        fontWeights = uniqueFontCombinations.map((font, idx) => [`font-${slugify(font.family)}-${idx}`, font.style]);

        paragraphSpacing = rawParagraphSpacing.sort((a, b) => a - b).map((size, idx) => [idx, size]);

        letterSpacing = rawLetterSpacing
            .filter((v, i, a) => a.findIndex((t) => t.unit === v.unit && t.value === v.value) === i)
            .map((lh, idx) => [idx, convertFigmaToLetterSpacing(lh)]);

        typography = figmaTextStyles.map((style) => {
            const obj = {
                fontFamily: `$fontFamilies.${fontFamilies.find((el: string[]) => el[1] === style.fontName.family)[0]}`,
                fontWeight: `$fontWeights.${
                    fontWeights.find(
                        (el: string[]) =>
                            el[0].includes(slugify(style.fontName.family)) && el[1] === style.fontName.style
                    )[0]
                }`,
                lineHeight: `$lineHeights.${
                    lineHeights.find(
                        (el: [number, string | number]) => el[1] === convertFigmaToLineHeight(style.lineHeight)
                    )[0]
                }`,
                fontSize: `$fontSizes.${fontSizes.find((el: number[]) => el[1] === style.fontSize)[0]}`,
                letterSpacing: `$letterSpacing.${
                    letterSpacing.find(
                        (el: [number, string | number]) => el[1] === convertFigmaToLetterSpacing(style.letterSpacing)
                    )[0]
                }`,
                paragraphSpacing: `$paragraphSpacing.${
                    paragraphSpacing.find((el: number[]) => el[1] === style.paragraphSpacing)[0]
                }`,
            };
            const styleObject: TypographyToken = {value: obj};

            if (style.description) {
                styleObject.description = style.description;
            }
            return [style.name, styleObject];
        });
    }
    notifyStyleValues({
        colors,
        fontFamilies,
        lineHeights,
        fontWeights,
        fontSizes,
        letterSpacing,
        paragraphSpacing,
        typography,
    });
}
