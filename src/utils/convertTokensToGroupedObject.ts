import {appendTypeToToken} from '@/app/components/createTokenObj';
import set from 'set-value';

export default function convertTokensToGroupedObject(tokens) {
    let tokenObj = {};
    tokenObj = tokens.reduce((acc, token) => {
        const obj = acc || {};
        const tokenWithType = appendTypeToToken(token);
        delete tokenWithType.name;
        delete tokenWithType.rawValue;
        delete tokenWithType.internal__Parent;
        set(obj, token.name, tokenWithType);
        return acc;
    }, {});
    return tokenObj;
}
