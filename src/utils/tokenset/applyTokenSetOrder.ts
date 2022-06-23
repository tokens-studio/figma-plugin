import type { AnyTokenList } from '@/types/tokens';

export function applyTokenSetOrder(tokenSets: Record<string, AnyTokenList>, order: string[]) {
  return Object.fromEntries(
    Object.entries(tokenSets).sort((a, b) => {
      const indexOfA = order.indexOf(a[0]);
      const indexOfB = order.indexOf(b[0]);
      return indexOfA < indexOfB ? -1 : 1;
    }),
  );
}
