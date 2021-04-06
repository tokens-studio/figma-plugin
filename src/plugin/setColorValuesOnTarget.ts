import {convertStringToFigmaGradient, convertToFigmaColor} from './helpers';

export default function setColorValuesOnTarget(target, token) {
    console.log('Setting color on target', target, token);
    try {
        const {description, value} = token;
        if (value.startsWith('linear-gradient')) {
            const {gradientStops, gradientTransform} = convertStringToFigmaGradient(value);
            const newPaint = {
                type: 'GRADIENT_LINEAR',
                gradientTransform,
                gradientStops,
            };
            target.paints = [newPaint];
        } else {
            const {color, opacity} = convertToFigmaColor(value);
            target.paints = [{color, opacity, type: 'SOLID'}];
        }

        if (description) {
            target.description = description;
        }
    } catch (e) {
        console.error('Error setting color', e);
    }
}
