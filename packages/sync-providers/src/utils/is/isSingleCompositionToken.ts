import { TokenTypes } from '../../constants';
import { TokenFormat } from '../../classes/TokenFormatStoreClass';
import type { SingleCompositionToken, SingleToken } from '../../types';
import type { TokenInJSON, Tokens } from '../convertTokens';
import { getTokenTypeKey, getTokenValueKey } from '../get';

export function isSingleCompositionToken(
  token: SingleToken | any,
  ignoreTokenFormat: boolean = false,
): token is SingleCompositionToken {
  if (typeof token !== 'object') return false;
  const tokenTypeKey = getTokenTypeKey(ignoreTokenFormat);
  const tokenValueKey = getTokenValueKey(ignoreTokenFormat);
  return (
    token[tokenTypeKey] === TokenTypes.COMPOSITION
    && (typeof token[tokenValueKey] === 'string'
      || (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleCompositionTokenInJSON(token: TokenInJSON | Tokens): token is SingleCompositionToken {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.COMPOSITION
    && (typeof token[TokenFormat.tokenValueKey] === 'string'
      || (typeof token[TokenFormat.tokenValueKey] === 'object'
        && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}
