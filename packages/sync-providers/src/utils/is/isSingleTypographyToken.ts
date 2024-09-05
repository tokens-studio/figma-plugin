import { TokenTypes } from '../../constants';
import { TokenFormat } from '../../classes/TokenFormatStoreClass';
import type { SingleTypographyToken, SingleTypographyTokenInJSON, SingleToken } from '../../types';
import type { TokenInJSON, Tokens } from '../convertTokens';
import { getTokenTypeKey, getTokenValueKey } from '../get';

export function isSingleTypographyToken(
  token: SingleToken | any,
  ignoreTokenFormat: boolean = false,
): token is SingleTypographyToken {
  if (typeof token !== 'object') return false;
  const tokenTypeKey = getTokenTypeKey(ignoreTokenFormat);
  const tokenValueKey = getTokenValueKey(ignoreTokenFormat);
  return (
    token[tokenTypeKey] === TokenTypes.TYPOGRAPHY
    && (typeof token[tokenValueKey] === 'string'
      || (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleTypographyTokenInJSON(token: TokenInJSON | Tokens): token is SingleTypographyTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.TYPOGRAPHY
    && (typeof token[TokenFormat.tokenValueKey] === 'string'
      || (typeof token[TokenFormat.tokenValueKey] === 'object'
        && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}
