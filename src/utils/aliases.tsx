import {checkAndEvaluateMath, convertToRgb} from '@/app/components/utils';
import {SingleTokenObject} from 'Types/tokens';
import checkIfValueToken from './checkIfValueToken';
import {findReferences} from './findReferences';

export default function getAliasValue(token: SingleTokenObject | string, tokens = []): string | null {
    let returnedValue = checkIfValueToken(token) ? (token.value as string) : (token as string);

    try {
        const tokenReferences = findReferences(returnedValue);
        if (tokenReferences?.length > 0) {
            const resolvedReferences = tokenReferences.map((ref) => {
                if (ref.length > 1) {
                    const nameToLookFor = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);

                    const foundToken = tokens.find((t) => t.name === nameToLookFor);
                    if (typeof foundToken !== 'undefined') return foundToken.value;
                }
                return ref;
            });
            tokenReferences.forEach((reference, index) => {
                returnedValue = returnedValue.replace(
                    reference,
                    resolvedReferences[index]?.value ?? resolvedReferences[index]
                );
            });
            if (returnedValue === 'null') {
                returnedValue = null;
            }
        }
        if (typeof returnedValue !== 'undefined') {
            if (!tokenReferences) {
                return convertToRgb(checkAndEvaluateMath(returnedValue));
            }
        }
    } catch (e) {
        console.log(`Error getting alias value of ${token}`, tokens);
    }
    return checkAndEvaluateMath(returnedValue);
}
