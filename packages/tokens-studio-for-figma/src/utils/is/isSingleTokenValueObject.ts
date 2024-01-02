import { TokenFormat } from '@/plugin/store';
import { SingleToken } from '@/types/tokens';

type SingleTokenValueObject = Pick<SingleToken, 'value'>;

export function isSingleTokenValueObject(token: SingleTokenValueObject | any): token is SingleTokenValueObject {
  return !!(
    token
    && typeof token === 'object'
    && TokenFormat.tokenValueKey in token
    && (
      typeof token[TokenFormat.tokenValueKey] !== 'undefined'
      && token[TokenFormat.tokenValueKey] !== null
      && !(typeof token[TokenFormat.tokenValueKey] === 'object' && (token && TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey]))
    )
  );
}
