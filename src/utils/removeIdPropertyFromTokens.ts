import { AnyTokenList } from '@/types/tokens';
import removeTokenId from './removeTokenId';

export default function removeIdPropertyFromTokens(tokens: Record<string, AnyTokenList>) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenList>>((acc, [key, val]) => {
    const newTokenList = val.map((token) => removeTokenId(token, true));
    acc[key] = newTokenList;
    return acc;
  }, {});

  return tokenObj;
}
