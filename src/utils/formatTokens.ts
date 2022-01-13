import set from 'set-value';

export default function formatTokens({
    tokens,
    tokenSets,
    includeAllTokens = false,
    includeParent = true,
    expandTypography = false,
}) {
    const nestUnderParent = includeAllTokens ? true : includeParent;
    const tokenObj = {};

    tokenSets.forEach((tokenSet) => {
        tokens[tokenSet].forEach((token) => {
            const {name, ...tokenWithoutName} = token;
            if (token.type === 'typography' && expandTypography) {
                const expandedTypography = Object.entries(tokenWithoutName.value).reduce((acc, [key, val]) => {
                    acc[key] = {
                        value: val,
                    };
                    return acc;
                }, {});
                set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, {...expandedTypography});
            } else {
                set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, tokenWithoutName);
            }
        });
    });

    return JSON.stringify(tokenObj, null, 2);
}
