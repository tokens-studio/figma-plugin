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
    const numbers = /^-?\d+(\.\d+)?$/;
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

export function hslaToRgba(hslaValues) {
    let h = hslaValues[0];
    let s = hslaValues[1];
    let l = hslaValues[2];
    let a = 1;

    if (hslaValues[3]) {
        a = hslaValues[3];
    }

    // Must be fractions of 1
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b, a];
}

export function convertToFigmaColor(input) {
    let color;
    let opacity;
    if (input.startsWith('rgb')) {
        const rgbValues = input.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        const {r, g, b, a = 1} = webRGBToFigmaRGB(rgbValues);
        color = {r, g, b};
        opacity = Number(a);
    } else if (input.startsWith('hsl')) {
        const hslValues = input.replace(/^hsla?\(|\s+|%|\)$/g, '').split(',');
        const rgbValues: any = hslaToRgba(hslValues);
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
