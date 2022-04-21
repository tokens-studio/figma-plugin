import { CheckAliasRegex } from '@/constants/AliasRegex';

export function checkIfContainsAlias(token?: string | number | null) {
  if (!token) return false;
  return Boolean(token.toString().match(CheckAliasRegex));
}
