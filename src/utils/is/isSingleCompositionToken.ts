import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken, SingleCompositionToken } from '@/types/tokens';

export function isSingleCompositionToken(token: SingleToken | any): token is SingleCompositionToken {
  if (typeof token !== 'object') return false;
  return token.type === TokenTypes.COMPOSITION && typeof token.value === 'object' && !('value' in token.value);
}
