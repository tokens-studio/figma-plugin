import {mergeDeep} from '@/plugin/helpers';
import {SingleTokenObject, TokenType} from 'types/tokens';

import tokenTypes from '../../config/tokenTypes';
import {DEFAULT_DEPTH_LEVEL} from './constants';

// Sort tokens by the last part of their name, e.g. global.colors.gray.50 comes before global.colors.gray.100
function sortTokens(tokens) {
    return tokens.sort((a, b) => {
        return a.name.split('.').pop() - b.name.split('.').pop();
    });
}

// Creates a tokens object so that tokens are displayed in groups in the UI. Respects the default depth level we set in our constants
export function createTokensObject(tokens: SingleTokenObject[]) {
    const tokensSorted = sortTokens(tokens);
    const obj = tokensSorted.reduce((acc, cur) => {
        const hasTypeProp = cur.type && cur.type !== '' && cur.type !== 'undefined';
        const propToSet = hasTypeProp ? cur.type : cur.name.split('.').slice(1, 2).toString();
        acc[propToSet] = acc[propToSet] || {values: {}};
        const depth =
            DEFAULT_DEPTH_LEVEL === cur.name.split('.').length ? DEFAULT_DEPTH_LEVEL - 1 : DEFAULT_DEPTH_LEVEL;
        const groupName = cur.name.split('.').slice(0, depth).join('.');
        acc[propToSet].values[groupName] = acc[propToSet].values[groupName] || [];
        acc[propToSet].values[groupName].push(cur);
        mergeDeep(acc[propToSet].values, {[groupName]: cur});
        return acc;
    }, {});
    return obj;
}

// Takes an array of tokens, transforms them into an object and merges that with values we require for the UI
export function mappedTokens(tokens: SingleTokenObject[]) {
    const tokenObj = {};
    Object.entries(createTokensObject(tokens)).forEach(
        ([key, group]: [string, {values: SingleTokenObject[]; type?: TokenType}]) => {
            tokenObj[key] = {
                values: group.values,
            };
        }
    );

    mergeDeep(tokenObj, tokenTypes);

    return Object.entries(tokenObj);
}
