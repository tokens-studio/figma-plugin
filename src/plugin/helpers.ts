/* eslint-disable no-param-reassign */
import {getDegreesForMatrix, getMatrixForDegrees} from '@/utils/matrix';
import {webRGBToFigmaRGB, hexToFigmaRGB, figmaRGBToHex} from '@figma-plugin/helpers';

interface RGBA {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

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

function trim(str) {
    return str.replace(/^\s+|\s+$/gm, '');
}

export function RGBAToHexA(rgba) {
    const inParts = rgba.substring(rgba.indexOf('(')).split(', ');
    const r = parseInt(trim(inParts[0].substring(1)), 10);
    const g = parseInt(trim(inParts[1]), 10);
    const b = parseInt(trim(inParts[2]), 10);
    const a = parseFloat(trim(inParts[3].substring(0, inParts[3].length - 1))).toFixed(2);
    const outParts = [
        r.toString(16),
        g.toString(16),
        b.toString(16),
        Math.round(a * 255)
            .toString(16)
            .substring(0, 2),
    ];

    // Pad single-digit output values
    outParts.forEach((part, i) => {
        if (part.length === 1) {
            outParts[i] = `0${part}`;
        }
    });

    return `#${outParts.join('')}`;
}

export function hslaToRgba(hslaValues) {
    const h = hslaValues[0];
    let s = hslaValues[1];
    let l = hslaValues[2];
    let a = 1;

    if (hslaValues[3]) {
        a = hslaValues[3];
    }

    // Must be fractions of 1
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (h >= 300 && h < 360) {
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

export function convertFigmaGradientToString(paint: GradientPaint) {
    const {gradientTransform, gradientStops} = paint;
    const gradientStopsString = gradientStops
        .map((stop) => `${figmaRGBToHex(stop.color)} ${Math.round(stop.position * 100 * 100) / 100}%`)
        .join(', ');
    const gradientTransformString = getDegreesForMatrix(gradientTransform);
    return `linear-gradient(${gradientTransformString}, ${gradientStopsString})`;
}

function convertDegreeToNumber(degreeString) {
    return degreeString.split('deg').join('');
}

export function convertStringToFigmaGradient(value: string) {
    const [gradientDegrees, ...colorStops] = value
        .substring(value.indexOf('(') + 1, value.lastIndexOf(')'))
        .split(', ');
    const degrees = convertDegreeToNumber(gradientDegrees);
    const gradientTransform = getMatrixForDegrees(degrees);

    const gradientStops = colorStops.map((stop) => {
        const seperatedStop = stop.split(' ');
        const {color, opacity} = convertToFigmaColor(seperatedStop[0]);
        const gradientColor = color;
        gradientColor.a = opacity;
        return {
            color: gradientColor,
            position: parseFloat(seperatedStop[1]) / 100,
        };
    });

    return {gradientStops, gradientTransform};
}

export function generateId(len, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let randomString = '';
    for (let i = 0; i < len; i++) {
        const randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}

export async function getUserId() {
    let userId = generateId(24);

    try {
        const id = await figma.clientStorage.getAsync('userId');
        if (typeof id === 'undefined') {
            figma.clientStorage.setAsync('userId', userId);
        } else {
            userId = id;
        }
    } catch (e) {
        console.error('error retrieving userId', e);
        figma.clientStorage.setAsync('userId', userId);
    }

    return userId;
}
