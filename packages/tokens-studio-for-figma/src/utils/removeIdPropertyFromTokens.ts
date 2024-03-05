import { AnyTokenList } from '@/types/tokens';
import removeTokenId from './removeTokenId';
import { SetTokenDataPayload } from '@/types/payloads';

export default function removeIdPropertyFromTokens(tokens: SetTokenDataPayload['values']) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenList>>((acc, [key, val]) => {
    const newTokenList = val.map((token) => removeTokenId(token, true));
    acc[key] = newTokenList;
    return acc;
  }, {});

  return tokenObj;
}
