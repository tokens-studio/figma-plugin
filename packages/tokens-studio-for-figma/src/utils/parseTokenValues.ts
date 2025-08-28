import { TokenTypes } from '@/constants/TokenTypes';
import { SetTokenDataPayload } from '@/types/payloads';
import { AnyTokenList, SingleToken, TokenStore } from '@/types/tokens';
import { convertToTokenArrayWithGroups, GroupDescription } from './convertTokens';
import { detectFormat } from './detectFormat';

export type TokenStoreWithGroups = {
  [key: string]: {
    tokens: AnyTokenList;
    groups: GroupDescription[];
  };
};

export default function parseTokenValues(tokens: SetTokenDataPayload['values']): TokenStore['values'] | TokenStoreWithGroups {
  // If we receive an array of tokens, move them all to the global set
  if (Array.isArray(tokens)) {
    return {
      global: tokens,
    };
  }

  // For a regular token-schema go through each and convert their values to a token array
  // reducing them down to a entries list which can be picked up using Object.fromEntries
  type TokenEntry = [string, AnyTokenList | Record<string, Partial<Record<TokenTypes, Record<string, SingleToken<false>>>>>];
  const reducedTokens = Object.entries(tokens).reduce<[string, AnyTokenList | { tokens: AnyTokenList; groups: GroupDescription[] }][]>((prev, group: TokenEntry) => {
    const parsedGroup = group[1];
    const tokenSetName = group[0];

    if (Array.isArray(parsedGroup)) {
      prev.push([group[0], parsedGroup]);
      return prev;
    }

    if (typeof parsedGroup === 'object') {
      detectFormat(parsedGroup, true);

      const convertedResult = convertToTokenArrayWithGroups({ tokens: parsedGroup });
      
      // Check if we have groups - if so, return the new structure
      if (convertedResult.groups && convertedResult.groups.length > 0) {
        // Prefix group paths with token set name
        const groupsWithPrefix = convertedResult.groups.map((group) => ({
          ...group,
          path: `${tokenSetName}.${group.path}`,
        }));

        // Prefix token names with token set name
        const tokensWithPrefix = convertedResult.tokens.map((token) => ({
          ...token,
          name: `${tokenSetName}.${token.name}`,
        }));

        prev.push([group[0], {
          tokens: tokensWithPrefix,
          groups: groupsWithPrefix,
        }]);
      } else {
        // Backward compatibility - if no groups, return just tokens
        prev.push([group[0], convertedResult.tokens]);
      }
      return prev;
    }

    return prev;
  }, []);

  return Object.fromEntries(reducedTokens);
}
