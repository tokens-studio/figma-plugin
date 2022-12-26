import { AliasRegex } from '@/constants/AliasRegex';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { getAliasValue } from './getAliasValue';

// @TODO -- removed string type logic for now
// Checks if token is an alias token and if it has a valid reference
export function checkIfAlias(token: SingleToken | string, allTokens: SingleToken[] = []): boolean {
  try {
    let aliasToken = false;
    if (typeof token === 'string') {
      aliasToken = Boolean(token.match(AliasRegex));
    } else if (token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW || token.type === TokenTypes.BORDER) {
      if (typeof token.value === 'string') { aliasToken = Boolean(String(token.value).match(AliasRegex)); } else {
        const arrayValue = Array.isArray(token.value) ? token.value : [token.value];
        aliasToken = arrayValue.some((value) => (
          Object.values(value).some((singleValue) => (
            Boolean(singleValue?.toString().match(AliasRegex))
          ))
        ));
      }
    } else if (token.type === TokenTypes.COMPOSITION) {
      return true;
    } else {
      aliasToken = Boolean(token.value.toString().match(AliasRegex));
    }

    // Check if alias is found
    if (aliasToken) {
      const aliasValue = getAliasValue(token, allTokens);
      return aliasValue != null;
    }
  } catch (e) {
    console.log(`Error checking alias of token ${typeof token === 'object' ? token.name : token}`, token, allTokens, e);
  }
  return false;
}
