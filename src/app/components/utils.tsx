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

export function isTypographyToken(token) {
    return 'fontFamily' in token || 'fontWeight' in token || 'fontSize' in token || 'lineHeight' in token;
}

// Light or dark check for Token Buttons: If color is very bright e.g. white we show a different style
export function lightOrDark(color) {
    if (typeof color !== 'string') {
        return;
    }
    // Variables for red, green, blue values
    let r;
    let g;
    let b;
    let hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
        // If RGB --> store the red, green, blue values in separate variables
        [, r, g, b] = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    } else {
        // If hex --> Convert it to RGB: http://gist.github.com/983661
        color = +`0x${color.slice(1).replace(color.length < 5 && /./g, '$&$&')}`;

        r = color >> 16;
        g = (color >> 8) & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 245.5) {
        return 'light';
    }

    return 'dark';
}

// Sets random color depending on Hash for use in colorful UI
export function colorByHashCode(value) {
    let hash = 0;
    if (value.length === 0) return hash;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) * 30 + hash;
    }
    const shortened = Math.abs(hash % 360);
    return `${shortened},100%,85%`;
}
