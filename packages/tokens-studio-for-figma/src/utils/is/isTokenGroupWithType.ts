import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { TokenInJSON, Tokens } from '../convertTokens';
import { TokenTypes } from '@/constants/TokenTypes';

export type TokenGroupInJSON = {
  [key: string]: TokenInJSON | TokenGroupInJSON;
} & (
  | {
    type?: TokenTypes;
  }
  | {
    $type?: TokenTypes;
  }
);

export function isTokenGroupWithType(token: Tokens): token is TokenGroupInJSON {
  return !!(
    token
    && typeof token === 'object'
    // There is no value key defined (which means it's a group) / or there is a value key defined and it's content is an object containing a value key (only relevant for the old format)
    && (!(TokenFormat.tokenValueKey in token) || (TokenFormat.tokenValueKey in token && typeof token[TokenFormat.tokenValueKey] === 'object' && TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey]!))
    && TokenFormat.tokenTypeKey in token
    && typeof token[TokenFormat.tokenTypeKey] === 'string'
  );
}
