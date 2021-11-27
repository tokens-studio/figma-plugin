import {SingleTokenObject} from 'Types/tokens';
import filterMatchingStyles from './figmaUtils/filterMatchingStyles';
import setEffectValuesOnTarget from './setEffectValuesOnTarget';

// Iterate over effectTokens to create objects that match figma styles
export default function updateEffectStyles(effectTokens, shouldCreate = false) {
    const effectStyles = figma.getLocalEffectStyles();

    effectTokens.map((token: SingleTokenObject) => {
        let matchingStyles = [];
        if (effectStyles.length > 0) {
            matchingStyles = filterMatchingStyles(token, effectStyles);
        }
        if (matchingStyles.length) {
            setEffectValuesOnTarget(matchingStyles[0], token);
        } else if (shouldCreate) {
            const style = figma.createEffectStyle();
            style.name = token.name;
            setEffectValuesOnTarget(style, token);
        }
    });
}
