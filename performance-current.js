const mergedTokens = [
    {name: '1', value: '{global.sizing.scale} * 4', type: 'sizing', internal__Parent: 'global'},
    {name: '2', value: '{global.1} + 1', type: 'sizing', internal__Parent: 'global'},
    {name: 'colors.red', value: '#ff0000', type: 'color', internal__Parent: 'global'},
    {name: 'colors.blue', value: '#0000ff', type: 'color', internal__Parent: 'global'},
    {name: 'colors.dark.blue', value: '{global.colors.blue}', type: 'color', internal__Parent: 'global'},
    {name: 'colors.dark.red', value: '{global.colors.red}', type: 'color', internal__Parent: 'global'},
    {name: 'sizing.scale', value: '2', type: 'spacing', internal__Parent: 'global'},
    {name: 'sizing.xxs', value: '4', type: 'spacing', internal__Parent: 'global'},
    {name: 'sizing.xs', value: '{global.sizing.xxs}', type: 'spacing', internal__Parent: 'global'},
    {
        name: 'sizing.sm',
        value: '{global.sizing.xs} * {global.sizing.scale}',
        type: 'spacing',
        internal__Parent: 'global',
    },
    {name: 'sizing.lg', value: '{global.sizing.sm} * 2', type: 'spacing', internal__Parent: 'global'},
    {name: 'sub.1', value: '{global.1} * {global.sizing.scale}', type: 'sizing', internal__Parent: 'global'},
    {name: 'sub.2', value: '{global.2} * {global.sizing.scale}', type: 'sizing', internal__Parent: 'global'},
    {name: 'sub.subsub.1', value: '{global.sub.1} * {global.sizing.scale}', type: 'sizing', internal__Parent: 'global'},
    {name: 'sub.subsub.2', value: '{global.sub.2} * {global.sizing.scale}', type: 'sizing', internal__Parent: 'global'},
    {
        name: 'sub.subsub.sub3.1',
        value: '{global.sub.subsub.1} * {global.sizing.scale}',
        type: 'sizing',
        internal__Parent: 'global',
    },
    {
        name: 'sub.subsub.sub3.2',
        value: '{global.sub.subsub.2} * {global.sizing.scale}',
        type: 'sizing',
        internal__Parent: 'global',
    },
    {name: 'text-decoration.link', value: 'underline', type: 'textDecoration', internal__Parent: 'global'},
    {name: 'text-case.base', value: 'initial', type: 'textCase', internal__Parent: 'global'},
    {name: 'spacing', value: '{global.sizing.scale} * 2.5', type: 'paragraphSpacing', internal__Parent: 'global'},
    {
        name: 'line-height.body',
        value: '1.25rem',
        description: 'this uses REM units',
        type: 'lineHeights',
        internal__Parent: 'global',
    },
    {
        name: 'type.body',
        value: {
            fontFamily: 'arial',
            fontWeight: 'normal',
            lineHeight: '1.45',
            fontSize: '16',
            letterSpacing: '1.43',
            textDecoration: 'none',
            paragraphSpacing: '2',
            textCase: 'initial',
        },
        type: 'typography',
        internal__Parent: 'global',
    },
    {
        name: 'type.h1',
        value: {
            fontFamily: 'sans serif',
            fontWeight: '{global.font-weight.em}',
            lineHeight: '{global.sizing.scale}',
            fontSize: '{global.sub.subsub.2}',
            letterSpacing: '1',
            paragraphSpacing: '1',
            textDecoration: 'none',
            textCase: 'normal',
        },
        type: 'typography',
        internal__Parent: 'global',
    },
    {name: 'font-weight.em', value: 'bold', type: 'fontWeights', internal__Parent: 'global'},
];
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        });
    }

    return mergeDeep(target, ...sources);
}

function checkIfValueToken(token) {
    return typeof token === 'object' && 'value' in token;
}

const aliasRegex = /(\$[^\s,]+\w)|({[^\s]+})/g;

function checkIfContainsAlias(token) {
    if (!token) return false;
    return Boolean(token.toString().match(aliasRegex));
}

const findReferences = (tokenValue) => {
    return tokenValue?.toString().match(aliasRegex);
};

function getAliasValue(token, tokens = []) {
    let returnedValue = checkIfValueToken(token) ? token.value : token;

    try {
        const tokenReferences = findReferences(returnedValue);

        if (tokenReferences?.length > 0) {
            const resolvedReferences = tokenReferences.map((ref) => {
                if (ref.length > 1) {
                    const nameToLookFor = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);

                    const foundToken = tokens.find((t) => t.name === nameToLookFor);
                    if (typeof foundToken !== 'undefined') return getAliasValue(foundToken, tokens);
                }
                return ref;
            });
            tokenReferences.forEach((reference, index) => {
                const resolved = resolvedReferences[index]?.value ?? resolvedReferences[index];
                returnedValue = returnedValue.replace(reference, resolved);
            });

            if (returnedValue === 'null') {
                returnedValue = null;
            }
        }
        if (typeof returnedValue !== 'undefined') {
            const remainingReferences = findReferences(returnedValue);

            if (!remainingReferences) {
                return returnedValue;
            }
        }
    } catch (e) {
        console.log(`Error getting alias value of ${token}`, tokens);
    }
    return returnedValue;
}

// Checks if token is an alias token and if it has a valid reference
function checkIfAlias(token, allTokens = []) {
    try {
        let aliasToken = false;
        if (typeof token === 'string') {
            aliasToken = Boolean(token.toString().match(aliasRegex));
        } else if (token.type === 'typography') {
            aliasToken = Object.values(token.value).some((typographyToken) => {
                return Boolean(typographyToken?.toString().match(aliasRegex));
            });
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

function findAllAliases(tokens) {
    return tokens.filter((token) => checkIfAlias(token, tokens));
}

function reduceToValues(tokens) {
    const reducedTokens = Object.entries(tokens).reduce((prev, group) => {
        prev.push({[group[0]]: group[1]});
        return prev;
    }, []);

    const assigned = mergeDeep({}, ...reducedTokens);

    return assigned;
}

function resolveTokenValues(tokens, previousCount) {
    const aliases = findAllAliases(tokens);
    let returnedTokens = tokens;
    returnedTokens = tokens.map((t, _, tokensInProgress) => {
        let returnValue;
        let failedToResolve;
        // Iterate over Typography and boxShadow Object to get resolved values
        if (['typography', 'boxShadow'].includes(t.type)) {
            returnValue = Object.entries(t.value).reduce((acc, [key, value]) => {
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

resolveTokenValues(mergedTokens);
