import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList } from '@/types/tokens';
import removeTokenId from './removeTokenId';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

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
        inheritTypeLevel, ...tokenWithoutTypeAndValue
      } = tokenWithoutName;
      // set type of group level
      set(tokenObj, getGroupTypeName(token.name, inheritTypeLevel), tokenWithoutName.type);
      tokenWithoutTypeAndValue[TokenFormat.tokenValueKey] = tokenWithoutName.value;
      tokenWithoutTypeAndValue[TokenFormat.tokenDescriptionKey] = tokenWithoutName.description;
      set(tokenObj, token.name, tokenWithoutTypeAndValue, { merge: true });
    } else {
      tokenWithoutName[TokenFormat.tokenTypeKey] = tokenWithoutName.type;
      tokenWithoutName[TokenFormat.tokenValueKey] = tokenWithoutName.value;
      tokenWithoutName[TokenFormat.tokenDescriptionKey] = tokenWithoutName.description;
      set(tokenObj, token.name, tokenWithoutName, { merge: true });
    }
  });

  return JSON.stringify(tokenObj, null, 2);
}
