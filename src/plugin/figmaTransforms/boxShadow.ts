export default function convertBoxShadowTypeToFigma(value: string) {
    switch (value) {
        case 'innerShadow':
            return 'INNER_SHADOW';
        default:
            return 'DROP_SHADOW';
    }
}
