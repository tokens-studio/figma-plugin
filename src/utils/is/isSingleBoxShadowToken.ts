import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken, SingleBoxShadowToken } from '@/types/tokens';

export function isSingleBoxShadowToken(token: SingleToken | any): token is SingleBoxShadowToken {
  if (typeof token !== 'object') return false;
  return token.type === TokenTypes.BOX_SHADOW && 
    (Array.isArray(token.value) || (typeof token.value === 'object' && !('value' in token.value)));
}
