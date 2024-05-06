import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleBorderToken, SingleBorderTokenInJSON, SingleToken } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

export function isSingleBorderToken(token: SingleToken | any): token is SingleBorderToken {
  if (typeof token !== 'object') return false;
  return token[TokenFormat.tokenTypeKey] === TokenTypes.BORDER
  && (typeof token[TokenFormat.tokenValueKey] === 'string' || (typeof token[TokenFormat.tokenValueKey] === 'object' && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])));
}

export function isSingleBorderTokenInJSON(token: TokenInJSON | Tokens): token is SingleBorderTokenInJSON {
  if (typeof token !== 'object') return false;
  return token[TokenFormat.tokenTypeKey] === TokenTypes.BORDER
  && (typeof token[TokenFormat.tokenValueKey] === 'string' || (typeof token[TokenFormat.tokenValueKey] === 'object' && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])));
}
