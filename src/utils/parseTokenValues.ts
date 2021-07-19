import convertToTokenArray from './convertTokens';

export default function parseTokenValues(tokens) {
    console.log('Parsing token values', tokens);
    // If we receive an array of tokens, move them all to the global set
    if (Array.isArray(tokens)) {
        return {
            global: tokens,
        };
    }

    // For a regular token-schema go through each and convert their values to a token array
    const reducedTokens = Object.entries(tokens).reduce((prev, group) => {
        const parsedGroup = group[1];

        if (typeof parsedGroup === 'object') {
            console.log('is obj', parsedGroup);

            const groupValues = [];
            const convertedToArray = convertToTokenArray({tokens: parsedGroup});
            convertedToArray.forEach(([key, value]) => {
                groupValues.push({name: key, ...value});
            });
            const convertedGroup = groupValues;
            prev.push({[group[0]]: convertedGroup});
            return prev;
        }
        if (Array.isArray(parsedGroup)) {
            console.log('Is an array', parsedGroup);
        }
    }, []);

    return Object.assign({}, ...reducedTokens);
}
