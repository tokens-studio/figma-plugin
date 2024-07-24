import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleToken, SingleBoxShadowToken, SingleBoxShadowTokenInJSON } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

const tokenTypeKey = 'type';
const tokenValueKey = 'value';

export function isSingleBoxShadowToken(token: SingleToken | any): token is SingleBoxShadowToken {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.BOX_SHADOW
    && (typeof token[tokenValueKey] === 'string'
      || Array.isArray(token[tokenValueKey])
      || (typeof token[tokenValueKey] === 'object'
        && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleBoxShadowTokenInJSON(token: TokenInJSON | Tokens): token is SingleBoxShadowTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.BOX_SHADOW
    && (typeof token[tokenValueKey] === 'string'
      || Array.isArray(token[tokenValueKey])
      || (typeof token[tokenValueKey] === 'object'
        && !(tokenValueKey in token[tokenValueKey])))
  );
}
