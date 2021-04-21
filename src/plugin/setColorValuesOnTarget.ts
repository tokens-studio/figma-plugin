import {convertToFigmaColor} from './figmaTransforms/colors';
import {convertStringToFigmaGradient} from './figmaTransforms/gradients';

export default function setColorValuesOnTarget(target, token, key = 'paints') {
    try {
        const {description, value} = token;
        if (value.startsWith('linear-gradient')) {
            const {gradientStops, gradientTransform} = convertStringToFigmaGradient(value);
            const newPaint = {
                type: 'GRADIENT_LINEAR',
                gradientTransform,
                gradientStops,
            };
            target[key] = [newPaint];
        } else {
            const {color, opacity} = convertToFigmaColor(value);
            target[key] = [{color, opacity, type: 'SOLID'}];
        }

        if (description) {
            target.description = description;
        }
    } catch (e) {
        console.error('Error setting color', e);
    }
}
