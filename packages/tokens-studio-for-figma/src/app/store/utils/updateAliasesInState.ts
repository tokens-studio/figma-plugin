import { AnyTokenList, SingleToken, TokenToRename } from '@/types/tokens';
import { replaceReferences } from '@/utils/findReferences';
import { TokenState } from '../models/tokenState';
import { updateModify } from './updateModify';

export function updateAliasesInState(tokens: Record<string, AnyTokenList>, data: TokenToRename) {
  const newTokens = Object.entries(tokens).reduce<TokenState['tokens']>(
    (acc, [key, values]) => {
      const newValues = values.map<SingleToken>((token) => {
        try {
        // Update references inside modify
          token = updateModify(token, data);

          // Update if token is of type array, e.g. box shadows
          if (Array.isArray(token.value)) {
            return {
              ...token,
              value: token.value.map((t) => Object.entries(t).reduce<Record<string, string | number>>((a, [k, v]) => {
                a[k] = replaceReferences(v.toString(), data.oldName, data.newName);
                return a;
              }, {})),
            } as SingleToken;
          }

          // Update if we have a composite token value, e.g. typography
          if (typeof token.value === 'object') {
            return {
              ...token,
              value: Object.entries(token.value).reduce<Record<string, string | number>>((a, [k, v]) => {
                a[k] = replaceReferences(v.toString(), data.oldName, data.newName);
                return a;
              }, {}),
            } as SingleToken;
          }

          // Update for remaining token value types
          return {
            ...token,
            value: replaceReferences(token.value.toString(), data.oldName, data.newName),
          } as SingleToken;
        } catch (e) {
          console.error(e);
          return token;
        }
      });

      acc[key] = newValues;
      return acc;
    },
    {},
  );
  return newTokens;
}
