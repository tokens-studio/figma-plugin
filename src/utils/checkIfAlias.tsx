import {SingleTokenObject} from '@types/tokens';
import {aliasRegex, getAliasValue} from './aliases';

// Checks if token is an alias token and if it has a valid reference
export default function checkIfAlias(token: SingleTokenObject, allTokens = []): boolean {
    try {
        const aliasToken = Boolean(token.value.toString().match(aliasRegex));

        // Check if alias is found
        if (aliasToken) {
            const aliasValue = getAliasValue(token.value, allTokens);
            return aliasValue != null;
        }
    } catch (e) {
        console.log('Error checking alias', token);
    }
    return false;
}
