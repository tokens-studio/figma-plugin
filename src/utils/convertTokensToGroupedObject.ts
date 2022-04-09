import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { TransformerOptions } from './types';
import { expand } from '@/utils/expand';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

// @TODO fix tokenObj
export default function convertTokensToGroupedObject(
  tokens: ResolveTokenValuesResult[],
  excludedSets: string[],
  options: TransformerOptions,
) {
  let tokenObj = {};
  tokenObj = tokens.reduce((acc, token) => {
    if (options.throwErrorWhenNotResolved && token.failedToResolve) {
      throw new Error(`ERROR: failed to resolve token "${token.name}"`);
    }
    if (token.internal__Parent && excludedSets.includes(token.internal__Parent)) {
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
