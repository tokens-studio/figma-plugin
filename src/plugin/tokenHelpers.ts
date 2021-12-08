/* eslint-disable no-param-reassign */
import {get, isUndefined, uniq} from 'lodash';
import {appendTypeToToken} from '@/app/components/createTokenObj';
import getAliasValue from '@/utils/aliases';
import checkIfAlias from '@/utils/checkIfAlias';
import checkIfContainsAlias from '@/utils/checkIfContainsAlias';
import {SingleTokenObject} from 'Types/tokens';
import {mergeDeep} from './helpers';
import {checkAndEvaluateMath} from '@/app/components/utils';

export function findAllAliases(tokens) {
    return tokens.filter((token) => checkIfAlias(token, tokens));
}

export function reduceToValues(tokens) {
    const reducedTokens = Object.entries(tokens).reduce((prev, group) => {
        prev.push({[group[0]]: group[1]});
        return prev;
    }, []);

    const assigned = mergeDeep({}, ...reducedTokens);

    return assigned;
}

// regex explanation https://regex101.com/r/dkzNQc/2
const aliasRegex = /(?<=\{)[^{]+(?=\})/g;

function resolveAliasValue(input: string, rawTokens: any): any {
    // find unique aliases in the input string to avoid unnecessary loops
    const aliases = uniq(input.match(aliasRegex));
    let hasAlias = false;
    let failedToResolve = false;
    let resolvedValue = input;

    // if no alias is found do nothing
    if (aliases.length > 0) {
        hasAlias = true;

        aliases.forEach((alias) => {
            const absolutePath = `${alias}.value`;
            const aliasValue = get(rawTokens, absolutePath);
            if (isUndefined(aliasValue)) {
                failedToResolve = true;
            } else {
                resolvedValue = resolvedValue.replace(`{${alias}}`, `(${aliasValue})`);
            }
        });
    }

    return {
        resolvedValue,
        failedToResolve,
        hasAlias,
    };
}

function hasCompoundValue(item) {
    return ['typography', 'boxShadow'].includes(item.type);
}

// parentheses are added around replaced alias values to make math work correctly. when a non-math property
// is aliased the parentheses have to be removed manually
function removeWrappingParentheses(value) {
    return typeof value === 'string' ? value.replace(/^\(|\)$/g, '') : value;
}

// loop through values to see if have alias
// keep count of aliases
// resolve alias
// return to top
// stop once alias count is 0 or the same as last round (throw error if number is same)
export function resolveAbsoluteTokenValues(structured = [], rawTokens) {
    if (structured.length < 1) {
        return [];
    }
    // clone input array and add initial value to rawValue key
    const resolved = structured.map((item) => ({...item, rawValue: item.value}));
    let previousUnresolvedCount = -1;

    function resolveLoop(list) {
        const potentiallyUnresolvedTokens = [];

        list.forEach((item) => {
            const isCompounded = hasCompoundValue(item);
            let {value} = item;
            // if the value is an object, convert it to a string to resolve
            if (isCompounded) {
                const str = JSON.stringify(item.value);
                value = str.slice(1, str.length - 1);
            }
            const {resolvedValue, failedToResolve, hasAlias} = resolveAliasValue(value, rawTokens);

            if (failedToResolve) {
                item.failedToResolve = true;
            }

            if (hasAlias) {
                potentiallyUnresolvedTokens.push(item);
            }

            item.value = isCompounded ? JSON.parse(`{${resolvedValue}}`) : resolvedValue;
        });

        if (
            potentiallyUnresolvedTokens.length !== 0 &&
            potentiallyUnresolvedTokens.length !== previousUnresolvedCount
        ) {
            previousUnresolvedCount = potentiallyUnresolvedTokens.length;
            resolveLoop(potentiallyUnresolvedTokens);
        }
    }

    // assume that all tokens potentially have aliases on the first run
    resolveLoop(resolved);

    return resolved.map((item) => {
        if (item.failedToResolve) {
            return item;
        }
        if (hasCompoundValue(item)) {
            return {
                ...item,
                value: Object.entries(item.value).reduce((object, [key, value]) => {
                    return {...object, [key]: removeWrappingParentheses(checkAndEvaluateMath(value))};
                }, {}),
            };
        }
        return {...item, value: removeWrappingParentheses(checkAndEvaluateMath(item.value))};
    });
}

export function resolveTokenValues(tokens, previousCount: number | undefined) {
    const aliases = findAllAliases(tokens);
    let returnedTokens = tokens;
    returnedTokens = tokens.map((t, _, tokensInProgress) => {
        let returnValue;
        let failedToResolve;
        // Iterate over Typography and boxShadow Object to get resolved values
        if (['typography', 'boxShadow'].includes(t.type)) {
            returnValue = Object.entries(t.value).reduce((acc, [key, value]: [string, SingleTokenObject]) => {
                acc[key] = getAliasValue(value, tokensInProgress);
                return acc;
            }, {});
        } else {
            // If we're not dealing with special tokens, just return resolved value
            returnValue = getAliasValue(t, tokensInProgress);

            failedToResolve = returnValue === null || checkIfContainsAlias(returnValue);
        }

        const returnObject = {
            ...t,
            value: returnValue,
            rawValue: t.rawValue || t.value,
            failedToResolve,
        };
        if (!failedToResolve) {
            delete returnObject.failedToResolve;
        }
        return returnObject;
    });

    if (aliases.length > 0 && (previousCount > aliases.length || !previousCount)) {
        return resolveTokenValues(returnedTokens, aliases.length);
    }

    return returnedTokens;
}

export function mergeTokenGroups(tokens, usedSets = []): SingleTokenObject[] {
    const mergedTokens = [];
    // Reverse token set order (right-most win) and check for duplicates
    Object.entries(tokens)
        .reverse()
        .forEach((tokenGroup: [string, SingleTokenObject[]]) => {
            if (!usedSets || usedSets.length === 0 || usedSets.includes(tokenGroup[0])) {
                tokenGroup[1].forEach((token) => {
                    if (!mergedTokens.some((t) => t.name === token.name))
                        mergedTokens.push({...appendTypeToToken(token), internal__Parent: tokenGroup[0]});
                });
            }
        });
    return mergedTokens;
}
