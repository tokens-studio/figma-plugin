import { SingleTokenValueObject } from './isSingleTokenValueObject';

export function isSingleInternalTokenValueObject(token: SingleTokenValueObject | any): token is SingleTokenValueObject {
  return !!(
    token
    && typeof token === 'object'
    && 'value' in token
    && (
      typeof token.value !== 'undefined'
      && token.value !== null
      && !(typeof token.value === 'object' && (token && 'value' in token.value))
    )
  );
}
