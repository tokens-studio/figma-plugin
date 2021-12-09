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
const unformattedTokens = {
    global: {
        1: {value: '{global.sizing.scale} * 4', type: 'sizing'},
        2: {value: '{global.1} + 1', type: 'sizing'},
        colors: {
            red: {value: '#ff0000', type: 'color'},
            blue: {value: '#0000ff', type: 'color'},
            dark: {
                blue: {value: '{global.colors.blue}', type: 'color'},
                red: {value: '{global.colors.red}', type: 'color'},
            },
        },
        sizing: {
            scale: {value: '2', type: 'spacing'},
            xxs: {value: '4', type: 'spacing'},
            xs: {value: '{global.sizing.xxs}', type: 'spacing'},
            sm: {value: '{global.sizing.xs} * {global.sizing.scale}', type: 'spacing'},
            lg: {value: '{global.sizing.sm} * 2', type: 'spacing'},
        },
        sub: {
            1: {value: '{global.1} * {global.sizing.scale}', type: 'sizing'},
            2: {value: '{global.2} * {global.sizing.scale}', type: 'sizing'},
            subsub: {
                1: {value: '{global.sub.1} * {global.sizing.scale}', type: 'sizing'},
                2: {value: '{global.sub.2} * {global.sizing.scale}', type: 'sizing'},
                sub3: {
                    1: {value: '{global.sub.subsub.1} * {global.sizing.scale}', type: 'sizing'},
                    2: {value: '{global.sub.subsub.2} * {global.sizing.scale}', type: 'sizing'},
                },
            },
        },
        'text-decoration': {link: {value: 'underline', type: 'textDecoration'}},
        'text-case': {base: {value: 'initial', type: 'textCase'}},
        spacing: {value: '{global.sizing.scale} * 2.5', type: 'paragraphSpacing'},
        'line-height': {body: {value: '1.25rem', description: 'this uses REM units', type: 'lineHeights'}},
        type: {
            body: {
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
            },
            h1: {
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
            },
        },
        'font-weight': {em: {value: 'bold', type: 'fontWeights'}},
    },
    light: {
        colors: {primary: {value: '$colors.red', type: 'color'}},
        sizing: {scale: {value: '3', type: 'spacing'}, xs: {value: '6', type: 'spacing'}},
    },
};

// regex explanation https://regex101.com/r/dkzNQc/2
const aliasRegex = /(?<=\{)[^{]+(?=\})/g;

function resolveAliasValue(input, rawTokens) {
    // find unique aliases in the input string to avoid unnecessary loops
    const aliases = [...new Set(input.match(aliasRegex))];
    let hasAlias = false;
    let failedToResolve = false;
    let resolvedValue = input;

    // if no alias is found do nothing
    if (aliases.length > 0) {
        hasAlias = true;

        aliases.forEach((alias) => {
            const absolutePath = `${alias}.value`;
            const aliasValue = rawTokens[absolutePath];
            if (typeof aliasValue === 'undefined') {
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
function resolveAbsoluteTokenValues(structured = [], rawTokens) {
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
                    return {...object, [key]: removeWrappingParentheses(value)};
                }, {}),
            };
        }
        return {...item, value: removeWrappingParentheses(item.value)};
    });
}

resolveAbsoluteTokenValues(mergedTokens, unformattedTokens);
