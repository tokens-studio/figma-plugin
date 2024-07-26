import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleBorderToken, SingleBorderTokenInJSON, SingleToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

function getTokenTypeKey(ignoreTokenFormat: boolean): string {
  const key = TokenFormat.tokenTypeKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}

function getTokenValueKey(ignoreTokenFormat: boolean): string {
  const key = TokenFormat.tokenValueKey;
  return ignoreTokenFormat && key.startsWith('$') ? key.slice(1) : key;
}

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
