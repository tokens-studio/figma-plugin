import omit from 'just-omit';
import { AnyTokenList, SingleToken } from '@/types/tokens';

export default function removeInheritType(tokens: Record<string, AnyTokenList>): Record<string, AnyTokenList> {
  return Object.entries(tokens).reduce<Record<string, AnyTokenList>>((acc, cur) => {
    const tokenGroup = cur[1].map((token) => ({
      ...omit(token, 'inheritTypeLevel'),
    }) as SingleToken);
    acc[cur[0]] = tokenGroup;
    return acc;
  }, {});
}
