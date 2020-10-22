/* eslint-disable no-param-reassign */
import {figmaRGBToHex} from '@figma-plugin/helpers';
import Dot from 'dot-object';
import {hashCode} from '../app/components/utils';
import {convertLineHeightToFigma, convertToFigmaColor} from './helpers';
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
    const {fontFamily, fontWeight, fontSize, lineHeight} = values;
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
    // Not used yet, but this is where we fetch text styles and should bring those into values that can be used by our tokens
    if (styleTypes.textStyles) {
        const fontSizes = [];
        const fontCombinations = [];
        const lineHeights = [];

        typography = figma.getLocalTextStyles();
        typography.map((style) => {
            if (!fontSizes.includes(style.fontSize)) fontSizes.push(style.fontSize);
            fontCombinations.push(style.fontName);
            lineHeights.push(style.lineHeight);
        });

        fontSizes.sort((a, b) => a - b);
        const uniqueFontCombinations = fontCombinations.filter(
            (v, i, a) => a.findIndex((t) => t.family === v.family && t.style === v.style) === i
        );

        const fontFamilies = [...new Set(uniqueFontCombinations.map((font) => font.family))].map((font, idx) => [
            `font-${hashCode(font)}`,
            font,
        ]);
        const fontWeights = uniqueFontCombinations.map((font, idx) => [
            `font-${hashCode(font.family)}-${idx}`,
            font.style,
        ]);

        console.log({typography, lineHeights, fontSizes, uniqueFontCombinations, fontFamilies, fontWeights});
    }
    notifyStyleValues({colors: []});
}
