import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { TransformerOptions } from './types';
import { expand } from '../app/components/utils';

export default function convertTokensToGroupedObject(tokens, excludedSets, options: TransformerOptions) {
  let tokenObj = {};
  tokenObj = tokens.reduce((acc, token) => {
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
    if (
      (!!options.expandTypography && tokenWithType.type === 'typography')
      || (!!options.expandShadow && tokenWithType.type === 'boxShadow')
    ) {
      const expanded = expand(tokenWithType.value);
      set(obj, token.name, { ...expanded });
    } else {
      set(obj, token.name, tokenWithType);
    }
    return acc;
  }, {});

  return tokenObj;
}
