import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleToken, SingleCompositionToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

export function isSingleCompositionToken(token: SingleToken | any): token is SingleCompositionToken {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.COMPOSITION
    && typeof token[TokenFormat.tokenValueKey] === 'object'
    && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])
  );
}

export function isSingleCompositionTokenInJSON(token: TokenInJSON | Tokens): token is SingleCompositionToken {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.COMPOSITION
    && typeof token[TokenFormat.tokenValueKey] === 'object'
    && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])
  );
}
