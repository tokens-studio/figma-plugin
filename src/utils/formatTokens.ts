import set from 'set-value';

export default function formatTokens(tokens, activeTokenSet) {
    const tokenObj = {};
    tokens[activeTokenSet].forEach((token) => {
        const {name, ...tokenWithoutName} = token;
        set(tokenObj, token.name, tokenWithoutName);
    });

    return JSON.stringify(tokenObj, null, 2);
}
