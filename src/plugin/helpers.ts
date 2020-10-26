/* eslint-disable no-param-reassign */
import {webRGBToFigmaRGB, hexToFigmaRGB} from '@figma-plugin/helpers';

interface RGBA {
    r: number;
    g: number;
    b: number;
    a?: number;
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        });
    }

    return mergeDeep(target, ...sources);
}

export function convertLineHeightToFigma(inputValue) {
    let lineHeight;
    const value = inputValue.toString();
    const numbers = /^\d+(\.\d+)?$/;
    if (value.match(numbers)) {
        lineHeight = {
            unit: 'PIXELS',
            value: Number(value),
        };
    } else if (value.trim().slice(-1) === '%' && value.trim().slice(0, -1).match(numbers)) {
        lineHeight = {
            unit: 'PERCENT',
            value: Number(value.slice(0, -1)),
        };
    } else {
        lineHeight = {
            unit: 'AUTO',
        };
    }
    return lineHeight;
}

export function convertFigmaToLineHeight(inputValue) {
    const {unit, value} = inputValue;
    if (unit === 'PIXELS') {
        return +value.toFixed(2);
    }
    if (unit === 'PERCENT') {
        return `${+value.toFixed(2)}%`;
    }
    return 'AUTO';
}

export function convertLetterSpacingToFigma(inputValue) {
    let letterSpacing;
    const value = inputValue.toString();
    const numbers = /^\d+(\.\d+)?$/;
    if (value.trim().slice(-1) === '%' && value.trim().slice(0, -1).match(numbers)) {
        letterSpacing = {
            unit: 'PERCENT',
            value: Number(value.slice(0, -1)),
        };
    } else if (value.match(numbers)) {
        letterSpacing = {
            unit: 'PIXELS',
            value: Number(value),
        };
    }
    return letterSpacing;
}

export function convertFigmaToLetterSpacing(inputValue) {
    const {unit, value} = inputValue;
    if (unit === 'PERCENT') {
        return `${+value.toFixed(2)}%`;
    }
    return +value.toFixed(2);
}

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

export function convertToFigmaColor(input) {
    let color;
    let opacity;
    if (input.startsWith('rgb')) {
        const rgbValues = input.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        const {r, g, b, a = 1} = webRGBToFigmaRGB(rgbValues);
        color = {r, g, b};
        opacity = Number(a);
    } else {
        const {r, g, b, a = 1}: RGBA = hexToFigmaRGB(input);
        color = {r, g, b};
        opacity = Number(a);
    }
    return {
        color,
        opacity,
    };
}
