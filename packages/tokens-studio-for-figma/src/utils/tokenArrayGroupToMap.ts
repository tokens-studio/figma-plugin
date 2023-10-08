import { AnyTokenList } from '@/types/tokens';

export function tokenArrayGroupToMap(tokens: AnyTokenList) {
  const tokensByNameMap = new Map<string, AnyTokenList[number]>(tokens.map((token) => ([token.name, token])));
  return tokensByNameMap;
}
