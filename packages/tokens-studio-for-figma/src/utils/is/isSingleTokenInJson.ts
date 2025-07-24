import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { TokenInJSON, Tokens } from '../convertTokens';

export function isSingleTokenInJSON(token: TokenInJSON | Tokens): token is TokenInJSON {
  return !!(
    token
    && typeof token === 'object'
    && TokenFormat.tokenValueKey in token
    && (
      typeof token[TokenFormat.tokenValueKey] !== 'undefined'
      && token[TokenFormat.tokenValueKey] !== null
      && !(typeof token[TokenFormat.tokenValueKey] === 'object' && (token && TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey]))
    )
  );
}
