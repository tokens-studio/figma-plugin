import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList, AnyTokenSet } from '@/types/tokens';
import { getGroupTypeName } from './stringifyTokens';
import removeTokenId from './removeTokenId';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

export default function convertTokensToObject(tokens: Record<string, AnyTokenList>, storeTokenIdInJsonEditor: boolean) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenSet<false>>>((acc, [key, val]) => {
    const tokenGroupObj: AnyTokenSet<false> = {};
    val.forEach((token) => {
      const tokenWithType = appendTypeToToken(token);
      const { name, ...tokenWithoutName } = removeTokenId(tokenWithType, !storeTokenIdInJsonEditor);
      if (tokenWithoutName.inheritTypeLevel) {
        const {
          inheritTypeLevel, ...tokenWithoutTypeAndValue
        } = tokenWithoutName;
        // set type of group level
        tokenWithoutTypeAndValue[TokenFormat.tokenValueKey] = tokenWithoutName.value;
        tokenWithoutTypeAndValue[TokenFormat.tokenDescriptionKey] = tokenWithoutName.description;
        set(tokenGroupObj, getGroupTypeName(token.name, inheritTypeLevel), tokenWithoutName.type);
        set(tokenGroupObj, token.name, tokenWithoutTypeAndValue, { merge: true });
      } else {
        const {
          type, value, description, ...tokenWithoutTypeAndValue
        } = tokenWithoutName;
        tokenWithoutTypeAndValue[TokenFormat.tokenTypeKey] = type;
        tokenWithoutTypeAndValue[TokenFormat.tokenValueKey] = value;
        tokenWithoutTypeAndValue[TokenFormat.tokenDescriptionKey] = description;
        set(tokenGroupObj, token.name, tokenWithoutTypeAndValue, { merge: true });
      }
    });
    acc[key] = tokenGroupObj;
    return acc;
  }, {});

  return tokenObj;
}
