import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { SingleToken, SingleTypographyToken, SingleTypographyTokenInJSON } from '@/types/tokens';
import { TokenInJSON, Tokens } from '../convertTokens';

export function isSingleTypographyToken(token: SingleToken | any): token is SingleTypographyToken {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.TYPOGRAPHY
    && (typeof token[TokenFormat.tokenValueKey] === 'string'
      || (typeof token[TokenFormat.tokenValueKey] === 'object'
        && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}

export function isSingleTypographyTokenInJSON(token: TokenInJSON | Tokens): token is SingleTypographyTokenInJSON {
  if (typeof token !== 'object') return false;
  return (
    token[TokenFormat.tokenTypeKey] === TokenTypes.TYPOGRAPHY
    && (typeof token[TokenFormat.tokenValueKey] === 'string'
      || (typeof token[TokenFormat.tokenValueKey] === 'object'
        && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])))
  );
}
