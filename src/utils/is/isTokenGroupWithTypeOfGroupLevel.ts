import { SingleToken } from '@/types/tokens';

type SingleTokenValueObject = Pick<SingleToken, 'value'>;

export function isTokenGroupWithTypeOfGroupLevel(token: SingleTokenValueObject | any): token is SingleTokenValueObject  {
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
