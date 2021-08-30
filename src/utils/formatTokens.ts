import set from 'set-value';

export default function formatTokens(tokens, activeTokenSet) {
    const tokenObj = {};
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

    return JSON.stringify(tokenObj, null, 2);
}
