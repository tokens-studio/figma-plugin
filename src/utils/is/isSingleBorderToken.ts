import { TokenTypes } from '@/constants/TokenTypes';
import { SingleBorderToken, SingleToken } from '@/types/tokens';

export function isSingleBorderToken(token: SingleToken | any): token is SingleBorderToken {
  if (typeof token !== 'object') return false;
  return token.type === TokenTypes.BORDER
  && (typeof token.value === 'string' || (typeof token.value === 'object' && !('value' in token.value)));
}
