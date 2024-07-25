import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleBoxShadowToken, SingleBoxShadowTokenInJSON, SingleToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

function getTokenTypeKey(ignoreTokenFormat: boolean): string {
  const key = TokenFormat.tokenTypeKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}

function getTokenValueKey(ignoreTokenFormat: boolean): string {
  const key = TokenFormat.tokenValueKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}

export function isSingleBoxShadowToken(
  token: SingleToken | any,
  ignoreTokenFormat: boolean = false,
): token is SingleBoxShadowToken {
  if (typeof token !== 'object') return false;
  const tokenTypeKey = getTokenTypeKey(ignoreTokenFormat);
  const tokenValueKey = getTokenValueKey(ignoreTokenFormat);
  return (
    token[tokenTypeKey] === TokenTypes.BOX_SHADOW &&
    (typeof token[tokenValueKey] === 'string' ||
      Array.isArray(token[tokenValueKey]) ||
      (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleBoxShadowTokenInJSON(token: TokenInJSON | Tokens): token is SingleBoxShadowTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.BOX_SHADOW &&
    (typeof token[TokenFormat.tokenValueKey] === 'string' ||
      Array.isArray(token[TokenFormat.tokenValueKey]) ||
      (typeof token[TokenFormat.tokenValueKey] === 'object' &&
        !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}
