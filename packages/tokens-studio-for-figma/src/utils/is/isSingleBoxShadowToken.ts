import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/store';
import { SingleToken, SingleBoxShadowToken } from '@/types/tokens';

export function isSingleBoxShadowToken(token: SingleToken | any): token is SingleBoxShadowToken {
  if (typeof token !== 'object') return false;
  return token[TokenFormat.tokenTypeKey] === TokenTypes.BOX_SHADOW
    && (typeof token[TokenFormat.tokenValueKey] === 'string' || Array.isArray(token[TokenFormat.tokenValueKey]) || (typeof token[TokenFormat.tokenValueKey] === 'object' && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])));
}
