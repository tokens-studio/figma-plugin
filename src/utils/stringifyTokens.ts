import set from 'set-value';

export default function stringifyTokens(tokens, activeTokenSet) {
    const tokenObj = {};
    tokens[activeTokenSet].values.forEach((token) => {
        const {name, ...tokenWithoutName} = token;
        set(tokenObj, token.name, tokenWithoutName);
    });

    return JSON.stringify(tokenObj, null, 2);
}
