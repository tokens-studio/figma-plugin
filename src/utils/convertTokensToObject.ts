import {appendTypeToToken} from '@/app/components/createTokenObj';
import set from 'set-value';

export default function convertTokensToObject(tokens) {
    const tokenObj = Object.entries(tokens).reduce((acc, [key, val]) => {
        const tokenGroupObj = {};
        val.forEach((token) => {
            const tokenWithType = appendTypeToToken(token);
            const {name, ...tokenWithoutName} = tokenWithType;
            set(tokenGroupObj, token.name, tokenWithoutName);
        });
        acc[key] = tokenGroupObj;
        return acc;
    }, {});

    return tokenObj;
}
