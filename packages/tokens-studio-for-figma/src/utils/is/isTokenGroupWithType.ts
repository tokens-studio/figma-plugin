import { SingleToken } from '@/types/tokens';

type SingleTokenValueObject = Pick<SingleToken, 'value'>;
type TokenGroupWithType = Pick<SingleToken, 'value'> & { type: string };

export function isTokenGroupWithType(token: SingleTokenValueObject | any): token is TokenGroupWithType {
  return !!(
    token
    && typeof token === 'object'
    && (!('value' in token) || ('value' in token && typeof token.value === 'object' && 'value' in token.value))
    && 'type' in token
    && (
      typeof token.type === 'string'
    )
  );
}
