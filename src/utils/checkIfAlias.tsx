import {SingleTokenObject} from '@/types/tokens';
import getAliasValue from './aliases';
import {aliasRegex} from './findReferences';

// Checks if token is an alias token and if it has a valid reference
export default function checkIfAlias(token: SingleTokenObject, allTokens = []): boolean {
    try {
        let aliasToken = false;
        if (typeof token === 'string') {
            aliasToken = Boolean(token.toString().match(aliasRegex));
        } else if (token.type === 'typography') {
            aliasToken = Object.values(token.value).some((typographyToken) =>
                Boolean(typographyToken?.toString().match(aliasRegex))
            );
        } else {
            aliasToken = checkIfAlias(token.value.toString(), allTokens);
        }

        // Check if alias is found
        if (aliasToken) {
            const aliasValue = getAliasValue(token, allTokens);
            return aliasValue != null;
        }
    } catch (e) {
        console.log(`Error checking alias of token ${token.name}`, token, allTokens, e);
    }
    return false;
}
