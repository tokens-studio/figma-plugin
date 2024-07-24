import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken, SingleCompositionToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

const tokenTypeKey = 'type';
const tokenValueKey = 'value';

export function isSingleCompositionToken(token: SingleToken | any): token is SingleCompositionToken {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.COMPOSITION
    && typeof token[tokenValueKey] === 'object'
    && !(tokenValueKey in token[tokenValueKey])
  );
}

export function isSingleCompositionTokenInJSON(token: TokenInJSON | Tokens): token is SingleCompositionToken {
  if (typeof token !== 'object') return false;
  return (
    token[tokenTypeKey] === TokenTypes.COMPOSITION
    && typeof token[tokenValueKey] === 'object'
    && !(tokenValueKey in token[tokenValueKey])
  );
}
