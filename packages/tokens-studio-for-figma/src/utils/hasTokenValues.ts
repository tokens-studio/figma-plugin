import { AnyTokenList } from '@/types/tokens';

export function hasTokenValues(values: Record<string, AnyTokenList>) {
  return Object.values(values ?? {}).some((value) => value.length > 0);
}
