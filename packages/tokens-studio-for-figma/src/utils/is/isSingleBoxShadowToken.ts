import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleToken, SingleBoxShadowToken, SingleBoxShadowTokenInJSON } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

export function isSingleBoxShadowToken(token: SingleToken | any): token is SingleBoxShadowToken {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.BOX_SHADOW
    && (typeof token[TokenFormat.tokenValueKey] === 'string'
      || Array.isArray(token[TokenFormat.tokenValueKey])
      || (typeof token[TokenFormat.tokenValueKey] === 'object'
        && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}

export function isSingleBoxShadowTokenInJSON(token: TokenInJSON | Tokens): token is SingleBoxShadowTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.BOX_SHADOW
    && (typeof token[TokenFormat.tokenValueKey] === 'string'
      || Array.isArray(token[TokenFormat.tokenValueKey])
      || (typeof token[TokenFormat.tokenValueKey] === 'object'
        && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}
