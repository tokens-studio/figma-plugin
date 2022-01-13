import {Parser} from 'expr-eval';
import convertOpacityToFigma from '@/plugin/figmaTransforms/opacity';
import {parseToRgba, readableColorIsBlack, toHex} from 'color2k';
import {postToFigma} from '../../plugin/notifiers';
import {MessageToPluginTypes} from '../../../types/messages';

const parser = new Parser();

export function checkAndEvaluateMath(expr) {
    try {
        parser.evaluate(expr);
        return +parser.evaluate(expr).toFixed(3);
    } catch (ex) {
        return expr;
    }
}

export function isValueToken(token): token is {value: string | number} {
    return (
        typeof token === 'object' &&
        (typeof token?.value === 'string' || typeof token?.value === 'number' || typeof token?.value === 'object')
    );
}

export function isTypographyToken(token) {
    if (typeof token !== 'object') return false;
    return token.type === 'typography';
}

export function isSingleToken(token): token is {value: string} {
    return typeof token === 'object' && 'value' in token && 'type' in token && 'name' in token;
}

// Convert non-conform colors to RGB value that can be used throughout the plugin
export function convertToRgb(color: string) {
    try {
        if (typeof color !== 'string') {
            return color;
        }
        const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
        const hslaRegex = /(hsla?\(.*?\))/g;
        const rgbaRegex = /(rgba?\(.*?\))/g;
        let returnedColor = color;

        try {
            const matchesRgba = Array.from(returnedColor.matchAll(rgbaRegex), (m) => m[0]);
            const matchesHsla = Array.from(returnedColor.matchAll(hslaRegex), (m) => m[0]);
            if (matchesHsla.length > 0) {
                matchesHsla.map((match) => {
                    returnedColor = returnedColor.replace(match, toHex(match));
                });
            }
            if (matchesRgba.length > 0) {
                matchesRgba.map((match) => {
                    const matchedString = match;
                    const matchedColor = match.replace(/rgba?\(/g, '').replace(')', '');
                    const matchesHexInsideRgba = matchedColor.match(hexRegex);
                    let r;
                    let g;
                    let b;
                    let alpha = '1';
                    if (matchesHexInsideRgba) {
                        [r, g, b] = parseToRgba(matchesHexInsideRgba[0]);
                        alpha = matchedColor.split(',').pop().trim();
                    } else {
                        [r, g, b, alpha = '1'] = matchedColor.split(',').map((n) => n.trim());
                    }
                    const a = convertOpacityToFigma(alpha);
                    returnedColor = returnedColor.split(matchedString).join(toHex(`rgba(${r}, ${g}, ${b}, ${a})`));
                });
            }
        } catch (e) {
            console.log('error', e, color);
        }
        return returnedColor;
    } catch (e) {
        console.error(e);
    }
}

// Light or dark check for Token Buttons: If color is very bright e.g. white we show a different style
export function lightOrDark(color: string) {
    if (typeof color !== 'string') {
        return 'light';
    }
    try {
        return readableColorIsBlack(color) ? 'light' : 'dark';
    } catch (e) {
        return 'light';
    }
}

// Converts string to slug
export function slugify(text: string) {
    return text
        .toString() // Cast to string
        .toLowerCase() // Convert the string to lowercase letters
        .normalize('NFD') // The normalize() method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-'); // Replace multiple - with single -
}

export function goToNodeId(id) {
    postToFigma({
        type: MessageToPluginTypes.GO_TO_NODE,
        id,
    });
}

export async function compareUpdatedAt(oldUpdatedAt, newUpdatedAt) {
    const newDate = new Date(newUpdatedAt).getTime();
    const oldDate = new Date(oldUpdatedAt).getTime();
    if (newDate > oldDate) {
        return 'remote_newer';
    }
    if (newDate === oldDate) {
        return 'same';
    }
    return 'remote_older';
}
