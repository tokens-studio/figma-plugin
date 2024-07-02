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
      const tokenWithoutId = removeTokenId(tokenWithType, !storeTokenIdInJsonEditor);

      // Remove the name key to not include it in the output
      const { name, ...tokenWithoutName } = tokenWithoutId;

      // Directly work with tokenWithoutName to preserve order
      if (tokenWithoutName.inheritTypeLevel) {
        // If inheritTypeLevel exists, handle it specifically
        const { inheritTypeLevel, ...tokenWithoutTypeLevel } = tokenWithoutName;

        // Set type of group level without altering the order of tokenWithoutName
        set(tokenGroupObj, getGroupTypeName(name, inheritTypeLevel), tokenWithoutName.type);

        // Add value and description keys directly to preserve order
        tokenWithoutName[TokenFormat.tokenValueKey] = tokenWithoutName.value;
        tokenWithoutName[TokenFormat.tokenDescriptionKey] = tokenWithoutName.description;
        set(tokenGroupObj, name, tokenWithoutTypeLevel, { merge: true });
      } else {
        // For tokens without inheritTypeLevel, directly add type, value, and description to preserve order
        tokenWithoutName[TokenFormat.tokenTypeKey] = tokenWithoutName.type;
        tokenWithoutName[TokenFormat.tokenValueKey] = tokenWithoutName.value;
        tokenWithoutName[TokenFormat.tokenDescriptionKey] = tokenWithoutName.description;

        set(tokenGroupObj, name, tokenWithoutName, { merge: true });
      }
    });
    acc[key] = tokenGroupObj;
    return acc;
  }, {});

  return tokenObj;
}
