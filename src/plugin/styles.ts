/* eslint-disable no-param-reassign */
import {figmaRGBToHex} from '@figma-plugin/helpers';
import Dot from 'dot-object';
import {slugify} from '../app/components/utils';
import {
    convertFigmaToLetterSpacing,
    convertFigmaToLineHeight,
    convertLetterSpacingToFigma,
    convertLineHeightToFigma,
    convertToFigmaColor,
} from './helpers';
import {notifyStyleValues} from './notifiers';

const dot = new Dot('/');

interface TextStyle {
    familyName: string;
    fontWeight: string;
    fontSize: number;
    lineHeight: string | number;
}

const updateColorStyles = (colorTokens, shouldCreate = false) => {
    const cols = dot.dot(colorTokens);
    const paints = figma.getLocalPaintStyles();
    Object.entries(cols).map(([key, value]) => {
        const matchingStyle = paints.filter((n) => n.name === key);
        if (typeof value === 'string') {
            const {color, opacity} = convertToFigmaColor(value);
            if (matchingStyle.length) {
                matchingStyle[0].paints = [{color, opacity, type: 'SOLID'}];
            } else if (shouldCreate) {
                const newStyle = figma.createPaintStyle();
                newStyle.paints = [{color, opacity, type: 'SOLID'}];
                newStyle.name = key;
            }
        }
    });
};

export const setTextValuesOnTarget = async (target, values) => {
    const {fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, paragraphSpacing} = values;
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
};

const updateTextStyles = (textTokens, shouldCreate = false) => {
    const cols = dot.dot(textTokens);
    // Iterate over textTokens to create objects that match figma styles
    // e.g. H1/Bold ...
    const tokenObj = Object.entries(cols).reduce((acc, [key, val]) => {
        // Split token object by `/`
        let parrentKey: string | string[] = key.split('/');

        // Store current key for future reference, e.g. fontFamily, lineHeight and remove it from key
        const curKey = parrentKey.pop();

        // Merge object again, now that we have the parent reference
        parrentKey = parrentKey.join('/');
        acc[parrentKey] = acc[parrentKey] || {};
        Object.assign(acc[parrentKey], {[curKey]: val});
        return acc;
    }, {});

    const textStyles = figma.getLocalTextStyles();

    Object.entries(tokenObj).map(([key, value]: [string, TextStyle]): void => {
        const matchingStyle = textStyles.filter((n) => n.name === key);

        if (matchingStyle.length) {
            setTextValuesOnTarget(matchingStyle[0], value);
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
            .filter((style) => style.paints.length === 1 && style.paints[0].type === 'SOLID')
            .map((style) => {
                const paint = style.paints[0];
                if (paint.type === 'SOLID') {
                    const {r, g, b} = paint.color;
                    const a = paint.opacity;
                    return [style.name, figmaRGBToHex({r, g, b, a})];
                }
                return null;
            });
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
                    fontWeights.find((el: string[]) => el[0].includes(slugify(style.fontName.family)))[0]
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
            return [style.name, obj];
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
