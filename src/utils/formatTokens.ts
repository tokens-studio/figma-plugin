import set from 'set-value';

export default function formatTokens(tokens, activeTokenSet) {
    const tokenObj = {};
    // For export purposes we need to maintain the parent object
    // else the token formatter won't work
    const nestedTokenObj = {[activeTokenSet]: tokenObj};

    tokens[activeTokenSet].forEach((token) => {
        const {name, ...tokenWithoutName} = token;
        if (token.type === 'typography') {
            const expandedTypography = Object.entries(tokenWithoutName.value).reduce((acc, [key, val]) => {
                acc[key] = {
                    value: val,
                };
                return acc;
            }, {});
            set(tokenObj, token.name, {...expandedTypography});
        } else {
            set(tokenObj, token.name, tokenWithoutName);
        }
    });

    return JSON.stringify(nestedTokenObj, null, 2);
}
