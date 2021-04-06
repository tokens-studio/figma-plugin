import {checkAndEvaluateMath, convertToRgb} from '@/app/components/utils';
import {SingleToken} from '@types/tokens';
import checkIfValueToken from './checkIfValueToken';

export const aliasRegex = /(\$[^\s]+\w)/g;

export function getAliasValue(token: SingleToken, tokens = []): string | null {
    let returnedValue = checkIfValueToken(token) ? (token.value as string) : (token as string);
    console.log('RETURNED VALIUE', token, returnedValue, tokens);

    const tokenReferences = returnedValue.toString().match(aliasRegex);
    console.log('REFERENCES ARE', tokenReferences);
    if (tokenReferences?.length > 0) {
        const resolvedReferences = tokenReferences.map((ref) => {
            if (ref.length > 1) {
                const value = tokens.find((t) => t.name === ref.substring(1));
                console.log('Value is', value);
                if (typeof value !== 'undefined') return value.value;
            }
            return null;
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
    if (returnedValue) {
        return convertToRgb(checkAndEvaluateMath(returnedValue));
    }
    return null;
}
