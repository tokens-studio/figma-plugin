/* eslint-disable no-param-reassign */
import {figmaRGBToHex} from '@figma-plugin/helpers';
import Dot from 'dot-object';
import {isSingleToken, slugify} from '../app/components/utils';
import {
    convertFigmaToLetterSpacing,
    convertFigmaToLineHeight,
    convertLetterSpacingToFigma,
    convertLineHeightToFigma,
    convertToFigmaColor,
} from './helpers';
import {notifyStyleValues} from './notifiers';

const dot = new Dot('/');

interface TypographyToken {
    value: {
        familyName: string;
        fontWeight: string;
        fontSize: number;
        lineHeight: string | number;
    };
    description?: string;
}

interface ColorToken {
    value: string;
    description?: string;
}

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
    const {color, opacity} = convertToFigmaColor(value);

    target.paints = [{color, opacity, type: 'SOLID'}];
    if (description) {
        target.description = description;
    }
};

const tokenProps = ['description', 'value'];
const typographyProps = ['fontSize', 'lineHeight', 'fontFamily', 'fontWeight', 'letterSpacing', 'paragraphSpacing'];

const createTokenObj = (dotTokens) => {
    // dotToken is e.g. as "H1/Regular/value/fontFamilies
    return Object.entries(dotTokens).reduce((acc, [key, token]) => {
        // Split token object by `/`
        const splitParent: string | string[] = key.split('/');
        // parentKey is now ["H1", "Regular", "fontFamilies"]
        const value = isSingleToken(token) ? token.value : token;

        // Store current key for future reference, e.g. fontFamily, lineHeight and remove it from key
        let curKey = splitParent[splitParent.length - 1];
        if (typographyProps.includes(curKey)) curKey = splitParent.pop();
        if (tokenProps.includes(splitParent[splitParent.length - 1])) splitParent.pop();

        // Merge object again, now that we have the parent reference
        const newParentKey = splitParent.join('/');

        // Set key to 'value' if parent and key match
        let objToSet = {
            [curKey]: value,
        };
        if (splitParent[splitParent.length - 1] === curKey) {
            objToSet = {value};
        }

        acc[newParentKey] = acc[newParentKey] || {};
        Object.assign(acc[newParentKey], objToSet);
        return acc;
    }, {});
};

const updateColorStyles = (colorTokens, shouldCreate = false) => {
    // Iterate over colorTokens to create objects that match figma styles
    const cols = dot.dot(colorTokens);
    const tokenObj = createTokenObj(cols);
    const paints = figma.getLocalPaintStyles();

    Object.entries(tokenObj).map(([key, value]: [string, ColorToken]) => {
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
    const cols = dot.dot(textTokens);
    const tokenObj = createTokenObj(cols);
    const textStyles = figma.getLocalTextStyles();

    Object.entries(tokenObj).map(([key, value]: [string, TypographyToken]) => {
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
            .filter((style) => style.paints.length === 1 && style.paints[0].type === 'SOLID')
            .map((style) => {
                const paint = style.paints[0];
                if (paint.type === 'SOLID') {
                    const {r, g, b} = paint.color;
                    const a = paint.opacity;
                    const description = style.description ?? null;
                    return [style.name, {value: figmaRGBToHex({r, g, b, a}), description}];
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
            const description = style.description ?? null;

            return [style.name, {value: obj, description}];
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
