import {getAliasValue} from '@/utils/aliases';
import checkIfAlias from '@/utils/checkIfAlias';
import {SingleTokenObject} from '@types/tokens';
import {mergeDeep} from './helpers';

export function findAllAliases(tokens) {
    return tokens.filter((token) => checkIfAlias(token, tokens));
}

export function reduceToValues(tokens) {
    console.log('reduce to val', tokens);

    const reducedTokens = Object.entries(tokens).reduce((prev, group) => {
        prev.push({[group[0]]: group[1].values});
        return prev;
    }, []);

    const assigned = mergeDeep({}, ...reducedTokens);

    return assigned;
}

export function resolveTokenValues(tokens, previousCount = undefined) {
    const aliases = findAllAliases(tokens);
    let returnedTokens = tokens;
    if (aliases.length > 0) {
        returnedTokens = tokens.map((t) => {
            let returnValue;
            // Iterate over Typography Object to get resolved values
            if (t.type === 'typography') {
                returnValue = Object.entries(t.value).reduce((acc, [key, value]) => {
                    acc[key] = getAliasValue(value, tokens);
                    return acc;
                }, {});
            } else {
                // If we're not dealing with typography tokens, just return resolved value
                returnValue = getAliasValue(t, tokens);
            }
            return {
                ...t,
                value: returnValue,
                rawValue: t.rawValue || t.value,
            };
        });
        if (previousCount > aliases.length || !previousCount) {
            return resolveTokenValues(returnedTokens);
        }
        console.log("Unable to resolve some aliases, these wont' resolve:", aliases);

        return returnedTokens;
    }
    return returnedTokens;
}

export function computeMergedTokens(tokens, usedTokenSet, shouldResolve = false): SingleTokenObject[] {
    const mergedTokens = [];
    Object.entries(tokens).forEach((tokenGroup) => {
        if (usedTokenSet.includes(tokenGroup[0])) {
            mergedTokens.push(...tokenGroup[1].values);
        }
    });

    if (shouldResolve && Object.entries(tokens).length > 0) {
        return resolveTokenValues(mergedTokens);
    }

    return mergedTokens;
}
