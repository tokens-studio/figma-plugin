import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList } from '@/types/tokens';
import removeTokenId from './removeTokenId';
import { TokenFormat } from '@/plugin/store';

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
        type, inheritTypeLevel, value, ...tokenWithoutTypeAndValue
      } = tokenWithoutName;
      // set type of group level
      set(tokenObj, getGroupTypeName(token.name, inheritTypeLevel), tokenWithoutName.type);
      set(tokenObj, token.name, tokenWithoutTypeAndValue);
      set(tokenObj, `${token.name}.${TokenFormat.tokenValueKey}`, value);
    } else {
      const {
        type, value, ...tokenWithoutTypeAndValue
      } = tokenWithoutName;
      set(tokenObj, token.name, tokenWithoutTypeAndValue);
      set(tokenObj, `${token.name}.${TokenFormat.tokenTypeKey}`, type);
      set(tokenObj, `${token.name}.${TokenFormat.tokenValueKey}`, value);
    }
  });

  return JSON.stringify(tokenObj, null, 2);
}
