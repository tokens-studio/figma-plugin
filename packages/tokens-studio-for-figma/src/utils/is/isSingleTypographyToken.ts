import { TokenTypes } from '@/constants/TokenTypes';
import { TokenFormat } from '@/plugin/store';
import { SingleToken, SingleTypographyToken } from '@/types/tokens';

export function isSingleTypographyToken(token: SingleToken | any): token is SingleTypographyToken {
  if (typeof token !== 'object') return false;
  return token[TokenFormat.tokenTypeKey] === TokenTypes.TYPOGRAPHY
  && (typeof token[TokenFormat.tokenValueKey] === 'string' || (typeof token[TokenFormat.tokenValueKey] === 'object' && !(TokenFormat.tokenValueKey in token[TokenFormat.tokenValueKey])));
}
