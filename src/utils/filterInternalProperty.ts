import { AnyTokenList } from '@/types/tokens';

export default function filterInternalProperty(
  tokens: Record<string, AnyTokenList>,
): Record<string, AnyTokenList> {
  return Object.entries(tokens).reduce<Record<string, AnyTokenList>>((acc, group) => {
    acc[group[0]] = group[1].map((token) => {
      const { inheritTypeLevel, ...rest } = token;
      return rest;
    });
    return acc;
  }, {});
}
