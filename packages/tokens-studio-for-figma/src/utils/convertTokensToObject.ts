import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList, AnyTokenSet } from '@/types/tokens';
import { TokenSetMetadata } from '@/types/tokens/TokenSetMetadata';
import { getGroupTypeName } from './stringifyTokens';
import removeTokenId from './removeTokenId';
import { setTokenKey, FormatSensitiveTokenKeys } from './setTokenKey';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

export default function convertTokensToObject(
  tokens: Record<string, AnyTokenList>,
  storeTokenIdInJsonEditor: boolean,
  metadata?: Record<string, TokenSetMetadata>,
) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenSet<false>>>((acc, [key, val]) => {
    const tokenGroupObj: AnyTokenSet<false> = {};
    
    // Add root-level metadata if available
    if (metadata?.[key]?.root) {
      if (metadata[key].root?.$description) {
        tokenGroupObj[TokenFormat.tokenDescriptionKey] = metadata[key].root.$description;
      }
      if (metadata[key].root?.$extensions) {
        tokenGroupObj.$extensions = metadata[key].root.$extensions;
      }
    }
    
    val.forEach((token) => {
      const tokenWithType = appendTypeToToken(token);
      const tokenWithoutId = removeTokenId(tokenWithType, !storeTokenIdInJsonEditor);

      // Remove the name key to not include it in the output
      const { name, ...tokenWithoutName } = tokenWithoutId;

      // Directly work with tokenWithoutName to preserve order
      if (tokenWithoutName.inheritTypeLevel) {
        // Remove the type key and if inheritTypeLevel exists, handle it specifically
        const { inheritTypeLevel, type, ...tokenWithoutTypeLevel } = tokenWithoutName;

        // Set type of group level without altering the order of tokenWithoutName
        set(tokenGroupObj, getGroupTypeName(name, inheritTypeLevel), tokenWithoutName.type);

        // Add value and description keys directly to preserve order
        setTokenKey(tokenWithoutTypeLevel, FormatSensitiveTokenKeys.VALUE);
        // Only add the description key if it exists
        if (tokenWithoutTypeLevel.description) {
          setTokenKey(tokenWithoutTypeLevel, FormatSensitiveTokenKeys.DESCRIPTION);
        }
        set(tokenGroupObj, name, tokenWithoutTypeLevel, { merge: true });
      } else {
        // For tokens without inheritTypeLevel, directly add type, value, and description to preserve order
        setTokenKey(tokenWithoutName, FormatSensitiveTokenKeys.TYPE);
        setTokenKey(tokenWithoutName, FormatSensitiveTokenKeys.VALUE);
        // Only add the description key if it exists
        if (tokenWithoutName.description) {
          setTokenKey(tokenWithoutName, FormatSensitiveTokenKeys.DESCRIPTION);
        }
        set(tokenGroupObj, name, tokenWithoutName, { merge: true });
      }
    });
    
    // Add group-level metadata after tokens are set
    if (metadata?.[key]?.groups) {
      Object.entries(metadata[key].groups!).forEach(([groupPath, groupMetadata]) => {
        if (groupMetadata.$description) {
          set(tokenGroupObj, `${groupPath}.${TokenFormat.tokenDescriptionKey}`, groupMetadata.$description);
        }
        if (groupMetadata.$extensions) {
          set(tokenGroupObj, `${groupPath}.$extensions`, groupMetadata.$extensions);
        }
      });
    }
    
    acc[key] = tokenGroupObj;
    return acc;
  }, {});

  return tokenObj;
}
