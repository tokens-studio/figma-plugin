import convertToTokenArray from '../utils/convertTokens';
import {ColorToken} from '../../types/propertyTypes';
import setColorValuesOnTarget from './setColorValuesOnTarget';

export default function updateColorStyles(colorTokens, shouldCreate = false) {
    // Iterate over colorTokens to create objects that match figma styles
    const colorTokenArray = convertToTokenArray({tokens: colorTokens, returnValuesOnly: true});
    const paints = figma.getLocalPaintStyles();

    colorTokenArray.map(([key, value]: [string, ColorToken]) => {
        let matchingStyles = [];
        if (paints.length > 0) {
            matchingStyles = paints.filter((n) => n.name === key);
        }
        if (matchingStyles.length) {
            setColorValuesOnTarget(matchingStyles[0], value);
        } else if (shouldCreate) {
            const style = figma.createPaintStyle();
            style.name = key;
            setColorValuesOnTarget(style, value);
        }
    });
}
