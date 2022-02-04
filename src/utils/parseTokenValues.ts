import convertToTokenArray from './convertTokens';

export default function parseTokenValues(tokens) {
  // If we receive an array of tokens, move them all to the global set
  if (Array.isArray(tokens)) {
    return {
      global: tokens,
    };
  }

  // For a regular token-schema go through each and convert their values to a token array
  const reducedTokens = Object.entries(tokens).reduce((prev, group) => {
    const parsedGroup = group[1];

    if (Array.isArray(parsedGroup)) {
      prev.push({ [group[0]]: parsedGroup });

      return prev;
    }

    if (typeof parsedGroup === 'object') {
      const convertedToArray = convertToTokenArray({ tokens: parsedGroup });
      prev.push({ [group[0]]: convertedToArray });
      return prev;
    }

    return prev;
  }, []);

  return Object.assign({}, ...reducedTokens);
}
