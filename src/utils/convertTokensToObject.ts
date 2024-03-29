import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList, AnyTokenSet } from '@/types/tokens';
import { getGroupTypeName } from './stringifyTokens';
import removeTokenId from './removeTokenId';

export default function convertTokensToObject(tokens: Record<string, AnyTokenList>, storeTokenIdInJsonEditor: boolean) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenSet<false>>>((acc, [key, val]) => {
    const tokenGroupObj: AnyTokenSet<false> = {};
    val.forEach((token) => {
      const tokenWithType = appendTypeToToken(token);
      const { name, ...tokenWithoutName } = removeTokenId(tokenWithType, !storeTokenIdInJsonEditor);
      if (tokenWithoutName.inheritTypeLevel) {
        const {
          type, inheritTypeLevel, ...tokenWithoutType
        } = tokenWithoutName;
        // set type of group level
        set(tokenGroupObj, getGroupTypeName(token.name, inheritTypeLevel), tokenWithoutName.type);
        set(tokenGroupObj, token.name, tokenWithoutType);
      } else {
        set(tokenGroupObj, token.name, tokenWithoutName);
      }
    });
    acc[key] = tokenGroupObj;
    return acc;
  }, {});

  return tokenObj;
}
