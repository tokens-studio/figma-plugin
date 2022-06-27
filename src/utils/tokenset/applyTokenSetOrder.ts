import type { AnyTokenList } from '@/types/tokens';

export function applyTokenSetOrder(tokenSets: Record<string, AnyTokenList>, order: (string[] | null | undefined) = null) {
  if (!order || !Array.isArray(order)) {
    return tokenSets;
  }

  return Object.fromEntries(
    Object.entries(tokenSets).sort((a, b) => {
      const indexOfA = order?.indexOf(a[0]) ?? -1;
      const indexOfB = order?.indexOf(b[0]) ?? -1;
      return indexOfA < indexOfB ? -1 : 1;
    }),
  );
}
