import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleCompositionToken, SingleToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';
import { getTokenTypeKey } from '../getTokenTypeKey';
import { getTokenValueKey } from '../getTokenValueKey';

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
