export function convertNumberToFigma(value) {
    return parseInt(value, 10);
}

export function fakeZeroForFigma(value) {
    return Number(value) === 0 ? 0.001 : value;
}

export function convertTypographyNumberToFigma(value) {
    const baseFontSize = 16;
    if (typeof value === 'string' && (value.endsWith('em') || value.endsWith('rem'))) {
        return parseFloat(value) * baseFontSize;
    }
    return parseFloat(value);
}
