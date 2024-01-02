import { TokenFormat } from '@/plugin/store';
import { SingleToken } from '@/types/tokens';

type SingleTokenValueObject = Pick<SingleToken, 'value'>;
type TokenGroupWithType = Pick<SingleToken, 'value'> & { $type?: string, type?: string };

export function isTokenGroupWithType(token: SingleTokenValueObject | any): token is TokenGroupWithType {
  return !!(
    token
    && typeof token === 'object'
    && (!(TokenFormat.tokenValueKey in token) || (TokenFormat.tokenValueKey in token && typeof token[TokenFormat.tokenValueKey] === 'object' && TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey]))
    && TokenFormat.tokenTypeKey in token
    && (
      typeof token[TokenFormat.tokenTypeKey] === 'string'
    )
  );
}
