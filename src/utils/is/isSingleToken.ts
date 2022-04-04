import { SingleToken } from '@/types/tokens';

export function isSingleToken(token: SingleToken | any): token is SingleToken {
  return (
    typeof token === 'object'
    && 'value' in token
    && 'name' in token
  );
}
