import { TokenTypes } from '@/constants/TokenTypes';
import { SingleColorToken, SingleToken } from '@/types/tokens';

export function isColorToken(token: SingleToken | any): token is SingleColorToken {
  if (typeof token !== 'object') return false;
  return token.type === TokenTypes.COLOR;
}
