import { TokenTypes } from '@/constants/TokenTypes';
import { SingleBorderToken, SingleBorderTokenInJSON, SingleToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

const tokenTypeKey = 'type';
const tokenValueKey = 'value';

export function isSingleBorderToken(token: SingleToken | any): token is SingleBorderToken {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.BORDER &&
    (typeof token[tokenValueKey] === 'string' ||
      (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}

export function isSingleBorderTokenInJSON(token: TokenInJSON | Tokens): token is SingleBorderTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.BORDER &&
    (typeof token[tokenValueKey] === 'string' ||
      (typeof token[tokenValueKey] === 'object' && !(tokenValueKey in token[tokenValueKey])))
  );
}
