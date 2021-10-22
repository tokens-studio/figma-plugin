import {SingleToken} from 'Types/tokens';
import {aliasRegex} from './findReferences';

export default function checkIfContainsAlias(token: SingleToken) {
    if (!token) return false;
    return Boolean(token.toString().match(aliasRegex));
}
