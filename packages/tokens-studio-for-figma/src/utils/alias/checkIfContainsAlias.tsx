import { checkAliasStartRegex } from '@/constants/AliasRegex';
import { SingleToken } from '@/types/tokens';

export function checkIfContainsAlias(token?: SingleToken['value'] | number | null) {
  if (!token) return false;
  return Boolean(token.toString().match(checkAliasStartRegex));
}
