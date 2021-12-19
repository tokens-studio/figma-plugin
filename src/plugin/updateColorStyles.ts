import {SingleTokenObject} from '@/types/tokens';
import {ColorToken} from '../types/propertyTypes';
import filterMatchingStyles from './figmaUtils/filterMatchingStyles';
import setColorValuesOnTarget from './setColorValuesOnTarget';

// Iterate over colorTokens to create objects that match figma styles
export default function updateColorStyles(colorTokens: SingleTokenObject[], shouldCreate = false) {
    const paints = figma.getLocalPaintStyles();

    colorTokens.map((token: ColorToken) => {
        let matchingStyles = [];
        if (paints.length > 0) {
            matchingStyles = filterMatchingStyles(token, paints);
        }
        if (matchingStyles.length) {
            setColorValuesOnTarget(matchingStyles[0], token);
        } else if (shouldCreate) {
            const style = figma.createPaintStyle();
            style.name = token.name;
            setColorValuesOnTarget(style, token);
        }
    });
}
