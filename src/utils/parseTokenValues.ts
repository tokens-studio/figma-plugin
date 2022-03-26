import { TokenTypes } from '@/constants/TokenTypes';
import { SetTokenDataPayload } from '@/types/payloads';
import { AnyTokenList, SingleToken, TokenStore } from '@/types/tokens';
import convertToTokenArray from './convertTokens';

export default function parseTokenValues(tokens: SetTokenDataPayload['values']): TokenStore['values'] {
  // If we receive an array of tokens, move them all to the global set
  if (Array.isArray(tokens)) {
    return {
      global: tokens,
    };
  }

  // For a regular token-schema go through each and convert their values to a token array
  // reducing them down to a entries list which can be picked up using Object.fromEntries
  type TokenEntry = [string, AnyTokenList | Record<string, Partial<Record<TokenTypes, Record<string, SingleToken<false>>>>>];
  const reducedTokens = Object.entries(tokens).reduce<[string, AnyTokenList][]>((prev, group: TokenEntry) => {
    const parsedGroup = group[1];

    if (Array.isArray(parsedGroup)) {
      prev.push([group[0], parsedGroup]);
      return prev;
    }

    if (typeof parsedGroup === 'object') {
      const convertedToArray = convertToTokenArray({ tokens: parsedGroup });
      prev.push([group[0], convertedToArray]);
      return prev;
    }

    return prev;
  }, []);

  return Object.fromEntries(reducedTokens);
}
