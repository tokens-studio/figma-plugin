import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import removeTokenId from './removeTokenId';
import { TokenFormat, TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { TokenInJSON } from './convertTokens';

export function getGroupTypeName(tokenName: string, groupLevel: number): string {
  if (tokenName.includes('.')) {
    const lastDotPosition = tokenName.split('.', groupLevel - 1).join('.').length;
    return `${tokenName.slice(0, lastDotPosition)}.${TokenFormat.tokenTypeKey}`;
  }
  return TokenFormat.tokenTypeKey;
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
      const {
        inheritTypeLevel, ...tokenWithoutInheritTypeLevel
      } = tokenWithoutName;
      const tokenInJSON: TokenInJSON = tokenWithoutInheritTypeLevel;
      // set type of group level
      set(tokenObj, getGroupTypeName(token.name, TokenFormat.format === TokenFormatOptions.DTCG ? inheritTypeLevel : inheritTypeLevel + 1), tokenInJSON.type);
      tokenInJSON[TokenFormat.tokenValueKey] = tokenWithoutName.value;
      tokenInJSON[TokenFormat.tokenDescriptionKey] = tokenWithoutName.description;
      if (TokenFormat.format === TokenFormatOptions.DTCG) {
        delete tokenInJSON.type;
        delete tokenInJSON.value;
        delete tokenInJSON.description;
      }
      delete tokenInJSON.type;
      set(tokenObj, token.name, tokenInJSON, { merge: true });
    } else {
      const tokenInJSON: TokenInJSON = tokenWithoutName;
      tokenInJSON[TokenFormat.tokenTypeKey] = tokenInJSON.type;
      tokenInJSON[TokenFormat.tokenValueKey] = tokenInJSON.value;
      tokenInJSON[TokenFormat.tokenDescriptionKey] = tokenInJSON.description;
      if (TokenFormat.format === TokenFormatOptions.DTCG) {
        delete tokenInJSON.type;
        delete tokenInJSON.value;
        delete tokenInJSON.description;
      }
      set(tokenObj, token.name, tokenInJSON, { merge: true });
    }
  });

  return JSON.stringify(tokenObj, null, 2);
}
