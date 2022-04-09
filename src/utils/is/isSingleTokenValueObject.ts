import { SingleToken } from '@/types/tokens';

type SingleTokenValueObject = Pick<SingleToken, 'value'>;

export function isSingleTokenValueObject(token: SingleTokenValueObject | any): token is SingleTokenValueObject {
  return (
    typeof token === 'object'
    && 'value' in token
    && typeof token.value !== 'undefined'
  );
}
