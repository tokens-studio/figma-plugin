/* eslint-disable no-param-reassign */
import Dot from 'dot-object';
import {convertLineHeightToFigma, convertToFigmaColor} from './helpers';

const dot = new Dot('/');

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

interface TextStyle {
    familyName: string;
    fontWeight: string;
    fontSize: number;
    lineHeight: string | number;
}

export const setTextValuesOnTarget = async (target, values) => {
    const {fontFamily, fontWeight, fontSize, lineHeight} = values;
    await figma.loadFontAsync({family: fontFamily, style: fontWeight});

    target.fontName = {
        family: fontFamily,
        style: fontWeight,
    };
    target.fontSize = fontSize;
    target.lineHeight = convertLineHeightToFigma(lineHeight);
};

const updateTextStyles = (textTokens, shouldCreate = false) => {
    const textStyles = figma.getLocalTextStyles();

    Object.entries(textTokens).map(([key, value]: [string, TextStyle]) => {
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
