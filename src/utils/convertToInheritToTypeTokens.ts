import { AnyTokenList } from '@/types/tokens';

export default function convertToInheritTypeTokens(tokens: Record<string, AnyTokenList>, oldInheritTypeTokens: Record<string, AnyTokenList>): Record<string, AnyTokenList> {
  return Object.entries(tokens).reduce<Record<string, AnyTokenList>>((acc, cur) => {
    const tokenGroup = cur[1].map((token) => {
      const oldInheritTypeToken = oldInheritTypeTokens[cur[0]]?.find((oldToken) => oldToken.name === token.name);
      if (oldInheritTypeToken?.inheritTypeLevel) {
        return oldInheritTypeToken;
      }
      return token;
    });
    acc[cur[0]] = tokenGroup;
    return acc;
  }, {});
}
