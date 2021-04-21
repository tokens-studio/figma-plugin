export function convertNumberToFigma(value) {
    return parseInt(value, 10);
}

export function convertTypographyNumberToFigma(value) {
    const baseFontSize = 16;
    if (typeof value === 'string' && (value.endsWith('em') || value.endsWith('rem'))) {
        return parseFloat(value) * baseFontSize;
    }
    return parseFloat(value);
}
