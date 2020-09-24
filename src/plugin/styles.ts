/* eslint-disable no-param-reassign */
import Dot from 'dot-object';
import {convertLineHeightToFigma, convertToFigmaColor} from './helpers';

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
