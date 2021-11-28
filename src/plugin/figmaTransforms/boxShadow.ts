export function convertBoxShadowTypeToFigma(value: string) {
    switch (value) {
        case 'innerShadow':
            return 'INNER_SHADOW';
        default:
            return 'DROP_SHADOW';
    }
}

export function convertBoxShadowTypeFromFigma(value: string) {
    switch (value) {
        case 'INNER_SHADOW':
            return 'innerShadow';
        default:
            return 'dropShadow';
    }
}
