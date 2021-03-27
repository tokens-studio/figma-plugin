import {SingleToken} from '../../types/tokens';
import {isTypographyToken, isValueToken} from '../app/components/utils';

function checkForTokens({obj, token, root = null, returnValuesOnly = false}): [object, SingleToken] {
    let returnValue;
    if (isValueToken(token)) {
        returnValue = token;
    } else if (isTypographyToken(token)) {
        returnValue = {
            value: Object.entries(token).reduce((acc, [key, val]) => {
                acc[key] = isValueToken(val) && returnValuesOnly ? val.value : val;
                return acc;
            }, {}),
        };
        if (token.description) {
            delete returnValue.value.description;
            returnValue.description = token.description;
        }
    } else if (typeof token === 'object') {
        Object.entries(token).map(([key, value]) => {
            const [, result] = checkForTokens({
                obj,
                token: value,
                root: [root, key].filter((n) => n).join('/'),
                returnValuesOnly,
            });
            if (root && result) {
                obj[[root, key].join('/')] = result;
            } else if (result) {
                obj[key] = result;
            }
        });
    } else {
        returnValue = {
            value: token,
        };
    }

    return [obj, returnValue];
}

export function convertToTokenArray(tokens, returnValuesOnly = false) {
    const [result] = checkForTokens({obj: {}, token: tokens, returnValuesOnly});
    return Object.entries(result);
}
