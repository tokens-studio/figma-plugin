import { TokenTypes } from '../../constants';
import { TokenFormat } from '../../classes/TokenFormatStoreClass';
import type { SingleBorderToken, SingleBorderTokenInJSON, SingleToken } from '../../types';
import type { TokenInJSON, Tokens } from '../convertTokens';
import { getTokenTypeKey, getTokenValueKey } from '../get';

export function isSingleBorderToken(
  token: SingleToken | any,
  ignoreTokenFormat: boolean = false,
): token is SingleBorderToken {
  if (typeof token !== 'object') return false;
  const tokenTypeKey = getTokenTypeKey(ignoreTokenFormat);
  const tokenValueKey = getTokenValueKey(ignoreTokenFormat);
  return (
    token[tokenTypeKey] === TokenTypes.BORDER
    && (typeof token[tokenValueKey] === 'string'
      || (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleBorderTokenInJSON(token: TokenInJSON | Tokens): token is SingleBorderTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.BORDER
    && (typeof token[TokenFormat.tokenValueKey] === 'string'
      || (typeof token[TokenFormat.tokenValueKey] === 'object'
        && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}
