import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { TransformerOptions } from './types';
import { expand } from '@/utils/expand';
import { getValueWithReferences } from '@/utils/getValueWithReferences';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

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
    const tokenWithType = appendTypeToToken(token) as SingleToken<false>;
    delete tokenWithType.name;
    if (options.resolveReferences !== true) {
      tokenWithType.value = getValueWithReferences(tokenWithType as SingleToken, options);
    } else {
      delete tokenWithType.$extensions;
    }

    if (!options.preserveRawValue) {
      delete tokenWithType.rawValue;
    }
    delete tokenWithType.internal__Parent;
    delete tokenWithType.resolvedValueWithReferences;
    if (
      (!!options.expandTypography && tokenWithType.type === TokenTypes.TYPOGRAPHY)
      || (!!options.expandShadow && tokenWithType.type === TokenTypes.BOX_SHADOW)
      || (!!options.expandComposition && tokenWithType.type === TokenTypes.COMPOSITION)
      || (!!options.expandBorder && tokenWithType.type === TokenTypes.BORDER)
    ) {
      // Only expand if the value is an object, not a string (alias)
      if (typeof tokenWithType.value === 'object' && tokenWithType.value !== null) {
        const expanded = expand(tokenWithType.value);
        set(obj, token.name, { ...expanded });
      } else {
        // If it's a string (alias), keep it as-is
        set(obj, token.name, tokenWithType);
      }
    } else {
      set(obj, token.name, tokenWithType);
    }
    return acc;
  }, {});

  return tokenObj;
}
