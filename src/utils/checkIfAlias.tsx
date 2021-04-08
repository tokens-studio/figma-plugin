import {SingleToken} from '@types/tokens';
import {aliasRegex, getAliasValue} from './aliases';
import checkIfValueToken from './checkIfValueToken';

export default function checkIfAlias(token: SingleToken, allTokens = []): boolean {
    let aliasToken = false;
    if (typeof token === 'string') {
        aliasToken = Boolean(token.toString().match(aliasRegex));
    } else if (checkIfValueToken(token)) {
        aliasToken = checkIfAlias(token.value.toString(), allTokens);
    }
    // Check if alias is found
    if (aliasToken) {
        const tokenToCheck = checkIfValueToken(token) ? token.value : token;
        const aliasValue = getAliasValue(tokenToCheck, allTokens);
        return aliasValue != null;
    }
    return false;
}
