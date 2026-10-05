import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList } from '@/types/tokens';
import removeTokenId from './removeTokenId';
import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { TokenInJSON } from './convertTokens';
import { processNumberValue } from './processNumberValue';
import { TokenTypes } from '@/constants/TokenTypes';

export function getGroupTypeName(tokenName: string, groupLevel: number): string {
  if (tokenName.includes('.')) {
    const lastDotPosition = tokenName.split('.', groupLevel - 1).join('.').length;
    return `${tokenName.slice(0, lastDotPosition)}.${TokenFormat.tokenTypeKey}`;
  }
  return TokenFormat.tokenTypeKey;
}

function processTokenValue(value: any, tokenType: string): any {
  if (tokenType === TokenTypes.NUMBER) {
    return processNumberValue(value);
  }
  return value;
}

// Move $deprecated to the end so metadata follows $value (DTCG convention).
// No-op for tokens without $deprecated, so existing output is unaffected.
export function reorderDeprecatedLast(token: Record<string, any>): void {
  if ('$deprecated' in token) {
    const deprecated = token.$deprecated;
    delete token.$deprecated;
    token.$deprecated = deprecated;
  }
}

export default function stringifyTokens(
  tokens: Record<string, AnyTokenList>,
  activeTokenSet: string,
  storeTokenIdInJsonEditor?: boolean,
): string {
  const tokenObj = {};
  tokens[activeTokenSet]?.forEach((token) => {
    const tokenWithType = appendTypeToToken(token);
    const { name, ...tokenWithoutName } = removeTokenId(tokenWithType, !storeTokenIdInJsonEditor);
    if (tokenWithoutName.inheritTypeLevel) {
      const { inheritTypeLevel, ...tokenWithoutInheritTypeLevel } = tokenWithoutName;
      const tokenInJSON: TokenInJSON = tokenWithoutInheritTypeLevel;
      // set type of group level
      set(tokenObj, getGroupTypeName(token.name, inheritTypeLevel), tokenInJSON.type);
      tokenInJSON[TokenFormat.tokenValueKey] = processTokenValue(tokenWithoutName.value, tokenWithoutName.type);
      tokenInJSON[TokenFormat.tokenDescriptionKey] = tokenWithoutName.description;
      if (TokenFormat.format === TokenFormatOptions.DTCG) {
        delete tokenInJSON.type;
        delete tokenInJSON.value;
        delete tokenInJSON.description;
      }
      delete tokenInJSON.type;
      reorderDeprecatedLast(tokenInJSON);
      set(tokenObj, token.name, tokenInJSON, { merge: true });
    } else {
      const tokenInJSON: TokenInJSON = tokenWithoutName;
      tokenInJSON[TokenFormat.tokenTypeKey] = tokenInJSON.type;
      tokenInJSON[TokenFormat.tokenValueKey] = processTokenValue(tokenInJSON.value, tokenInJSON.type);
      tokenInJSON[TokenFormat.tokenDescriptionKey] = tokenInJSON.description;
      if (TokenFormat.format === TokenFormatOptions.DTCG) {
        delete tokenInJSON.type;
        delete tokenInJSON.value;
        delete tokenInJSON.description;
      }
      reorderDeprecatedLast(tokenInJSON);
      set(tokenObj, token.name, tokenInJSON, { merge: true });
    }
  });

  return JSON.stringify(tokenObj, null, 2);
}
