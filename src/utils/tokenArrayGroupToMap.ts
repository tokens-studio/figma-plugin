import { TokenArrayGroup } from '@/types/tokens';

export function tokenArrayGroupToMap(tokens: TokenArrayGroup) {
  const tokensByNameMap = new Map<string, TokenArrayGroup[number]>(tokens.map((token) => ([token.name, token])));
  return tokensByNameMap;
}
