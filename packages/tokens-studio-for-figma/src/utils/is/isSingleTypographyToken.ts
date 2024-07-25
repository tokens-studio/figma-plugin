import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleTypographyToken, SingleTypographyTokenInJSON, SingleToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

function getTokenTypeKey(ignoreTokenFormat: boolean): string {
  const key = TokenFormat.tokenTypeKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}

function getTokenValueKey(ignoreTokenFormat: boolean): string {
  const key = TokenFormat.tokenValueKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}

export function isSingleTypographyToken(
  token: SingleToken | any,
  ignoreTokenFormat: boolean = false,
): token is SingleTypographyToken {
  if (typeof token !== 'object') return false;
  const tokenTypeKey = getTokenTypeKey(ignoreTokenFormat);
  const tokenValueKey = getTokenValueKey(ignoreTokenFormat);
  return (
    token[tokenTypeKey] === TokenTypes.TYPOGRAPHY &&
    (typeof token[tokenValueKey] === 'string' ||
      (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleTypographyTokenInJSON(token: TokenInJSON | Tokens): token is SingleTypographyTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.TYPOGRAPHY &&
    (typeof token[TokenFormat.tokenValueKey] === 'string' ||
      (typeof token[TokenFormat.tokenValueKey] === 'object' &&
        !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}
