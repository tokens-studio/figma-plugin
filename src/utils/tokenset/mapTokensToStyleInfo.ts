import type { AnyTokenList } from '@/types/tokens';

export function mapTokensToStyleInfo(
  values: Record<string, AnyTokenList>,
  figmaStyleReferences: Record<string, string>,
) {
  return Object.entries(figmaStyleReferences).map(([id, styleId]) => {

  });
}
