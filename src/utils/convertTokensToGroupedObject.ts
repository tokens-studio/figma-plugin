import {appendTypeToToken} from '@/app/components/createTokenObj';
import set from 'set-value';

export default function convertTokensToGroupedObject(tokens) {
    let tokenObj = {};
    tokenObj = tokens.reduce((acc, token) => {
        const key = token.internal__Parent;
        const obj = acc[key] || {};
        const tokenWithType = appendTypeToToken(token);
        delete tokenWithType.name;
        delete tokenWithType.rawValue;
        delete tokenWithType.internal__Parent;
        set(obj, token.name, tokenWithType);
        acc[key] = {
            ...acc[key],
            ...obj,
        };
        return acc;
    }, {});
    return tokenObj;
}
