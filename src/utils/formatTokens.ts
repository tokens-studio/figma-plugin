import set from 'set-value';

export default function formatTokens({
  tokens,
  tokenSets,
  includeAllTokens = false,
  includeParent = true,
  expandTypography = false,
  expandShadow = false,
}) {
  const nestUnderParent = includeAllTokens ? true : includeParent;
  const tokenObj = {};

  tokenSets.forEach((tokenSet) => {
    tokens[tokenSet].forEach((token) => {
      const { name, ...tokenWithoutName } = token;
      if (token.type === 'typography' && expandTypography) {
        const expandedTypography = Object.entries(tokenWithoutName.value).reduce((acc, [key, val]) => {
          acc[key] = {
            value: val,
            type: key,
          };
          return acc;
        }, {});
        set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, { ...expandedTypography });
      } else if (token.type === 'boxShadow' && expandShadow) {
        const expandedShadow = Object.entries(tokenWithoutName.value).reduce((acc, [key, val]) => {
          acc[key] = {
            value: val,
            type: key,
          };
          return acc;
        }, {});
        set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, { ...expandedShadow });
      } else {
        set(tokenObj, nestUnderParent ? [tokenSet, token.name].join('.') : token.name, tokenWithoutName);
      }
    });
  });

  return JSON.stringify(tokenObj, null, 2);
}
