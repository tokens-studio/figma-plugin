import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { TransformerOptions } from './types';

export default function convertTokensToGroupedObject(tokens, excludedSets, options: TransformerOptions) {
  let tokenObj = {};
  tokenObj = tokens.reduce((acc, token) => {
    if (options.throwErrorWhenNotResolved && token.failedToResolve) {
      throw new Error(`ERROR: failed to resolve token "${token.name}"`);
    }
    if (excludedSets.includes(token.internal__Parent)) {
      return acc;
    }
    const obj = acc || {};
    const tokenWithType = appendTypeToToken(token);
    delete tokenWithType.name;
    if (!options.preserveRawValue) {
      delete tokenWithType.rawValue;
    }
    delete tokenWithType.internal__Parent;
    if (!!options.expandTypography && tokenWithType.type === 'typography') {
      const expandedTypography = Object.entries(tokenWithType.value).reduce((acc, [key, val]) => {
        acc[key] = {
          value: val,
        };
        return acc;
      }, {});
      set(obj, token.name, { ...expandedTypography });
    } else {
      set(obj, token.name, tokenWithType);
    }
    return acc;
  }, {});

  return tokenObj;
}
