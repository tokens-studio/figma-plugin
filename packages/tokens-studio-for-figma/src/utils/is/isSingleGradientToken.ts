import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleGradientToken, SingleGradientTokenInJSON, SingleToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';
import { getTokenTypeKey } from '../getTokenTypeKey';
import { getTokenValueKey } from '../getTokenValueKey';

export function isSingleGradientToken(
  token: SingleToken | any,
  ignoreTokenFormat: boolean = false,
): token is SingleGradientToken {
  if (typeof token !== 'object') return false;
  const tokenTypeKey = getTokenTypeKey(ignoreTokenFormat);
  const tokenValueKey = getTokenValueKey(ignoreTokenFormat);
  const value = token[tokenValueKey];
  return (
    token[tokenTypeKey] === TokenTypes.GRADIENT
    && (typeof value === 'string'
      || (typeof value === 'object' && value !== null && !(tokenValueKey in value)))
  );
}

export function isSingleGradientTokenInJSON(token: TokenInJSON | Tokens): token is SingleGradientTokenInJSON {
  if (typeof token !== 'object') return false;
  const value = token[TokenFormat.tokenValueKey];
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.GRADIENT
    && (typeof value === 'string'
      || (typeof value === 'object' && value !== null && !(TokenFormat.tokenValueKey in value)))
  );
}
