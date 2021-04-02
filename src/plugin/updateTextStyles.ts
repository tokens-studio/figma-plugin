import {convertToTokenArray} from '../utils/convertTokens';
import {TypographyToken} from '../../types/propertyTypes';
import setTextValuesOnTarget from './setTextValuesOnTarget';

export default function updateTextStyles(textTokens, shouldCreate = false) {
    // Iterate over textTokens to create objects that match figma styles
    const textTokenArray = convertToTokenArray(textTokens, true);
    const textStyles = figma.getLocalTextStyles();

    textTokenArray.map(([key, value]: [string, TypographyToken]) => {
        let matchingStyles = [];
        if (textStyles.length > 0) {
            matchingStyles = textStyles.filter((n) => {
                const splitName = n.name.split('/').map((name) => name.trim());
                const splitKey = key.split('/').map((name) => name.trim());

                if (splitKey[splitKey.length - 1] === 'value') {
                    splitKey.pop();
                }
                const trimmedName = splitName.join('/');
                const trimmedKey = splitKey.join('/');

                return trimmedName === trimmedKey;
            });
        }

        if (matchingStyles.length) {
            setTextValuesOnTarget(matchingStyles[0], value);
        } else if (shouldCreate) {
            const style = figma.createTextStyle();
            style.name = key;
            setTextValuesOnTarget(style, value);
        }
    });
}
