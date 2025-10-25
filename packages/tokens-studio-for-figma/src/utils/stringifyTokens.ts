import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList } from '@/types/tokens';
import { TokenSetMetadata } from '@/types/tokens/TokenSetMetadata';
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

export default function stringifyTokens(
  tokens: Record<string, AnyTokenList>,
  activeTokenSet: string,
  storeTokenIdInJsonEditor?: boolean,
  metadata?: Record<string, TokenSetMetadata>,
): string {
  const tokenObj: any = {};
  
  // Add root-level metadata if available
  if (metadata?.[activeTokenSet]?.root) {
    if (metadata[activeTokenSet].root?.$description) {
      tokenObj[TokenFormat.tokenDescriptionKey] = metadata[activeTokenSet].root.$description;
    }
    if (metadata[activeTokenSet].root?.$extensions) {
      tokenObj.$extensions = metadata[activeTokenSet].root.$extensions;
    }
  }
  
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
      set(tokenObj, token.name, tokenInJSON, { merge: true });
    }
  });

  // Add group-level metadata after tokens are set
  if (metadata?.[activeTokenSet]?.groups) {
    Object.entries(metadata[activeTokenSet].groups!).forEach(([groupPath, groupMetadata]) => {
      if (groupMetadata.$description) {
        set(tokenObj, `${groupPath}.${TokenFormat.tokenDescriptionKey}`, groupMetadata.$description);
      }
      if (groupMetadata.$extensions) {
        set(tokenObj, `${groupPath}.$extensions`, groupMetadata.$extensions);
      }
    });
  }

  return JSON.stringify(tokenObj, null, 2);
}
