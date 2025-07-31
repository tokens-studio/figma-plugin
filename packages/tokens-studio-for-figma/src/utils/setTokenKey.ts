import { SingleToken } from '@/types/tokens';
import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

export type SingleTokenWithoutName = Omit<SingleToken, 'name'>;
export type SingleTokenWithoutNameOrType = Omit<SingleToken, 'name' | 'type'>;

export enum FormatSensitiveTokenKeys {
  TYPE = 'type',
  VALUE = 'value',
  DESCRIPTION = 'description',
}

export function setTokenKey(token: SingleTokenWithoutName | SingleTokenWithoutNameOrType, keyName: FormatSensitiveTokenKeys): SingleTokenWithoutName | SingleTokenWithoutNameOrType {
  const isDTCG = TokenFormat.format === TokenFormatOptions.DTCG;

  if (isDTCG) {
    token[`$${keyName}`] = token[keyName];
    if (token.hasOwnProperty(keyName)) {
      delete token[keyName];
    }
  } else {
    const tempValue = token[`$${keyName}`] || token[keyName];
    token[keyName] = tempValue;
    if (token.hasOwnProperty(`$${keyName}`)) {
      delete token[`$${keyName}`];
    }
  }

  return token;
}
