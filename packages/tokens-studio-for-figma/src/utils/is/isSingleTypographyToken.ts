import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken, SingleTypographyToken, SingleTypographyTokenInJSON } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

const tokenTypeKey = 'type';
const tokenValueKey = 'value';

export function isSingleTypographyToken(token: SingleToken | any): token is SingleTypographyToken {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.TYPOGRAPHY &&
    (typeof token[tokenValueKey] === 'string' ||
      (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleTypographyTokenInJSON(token: TokenInJSON | Tokens): token is SingleTypographyTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.TYPOGRAPHY &&
    (typeof token[tokenValueKey] === 'string' ||
      (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}
