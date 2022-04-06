import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken, SingleTypographyToken } from '@/types/tokens';

export function isSingleTypographyToken(token: SingleToken | any): token is SingleTypographyToken {
  if (typeof token !== 'object') return false;
  return token.type === TokenTypes.TYPOGRAPHY;
}
