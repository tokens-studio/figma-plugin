import set from 'set-value';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { AnyTokenList, AnyTokenSet } from '@/types/tokens';

export default function convertTokensToObject(tokens: Record<string, AnyTokenList>) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenSet>>((acc, [key, val]) => {
    const tokenGroupObj: AnyTokenSet = {};
    val.forEach((token) => {
      const tokenWithType = appendTypeToToken(token);
      const { name, ...tokenWithoutName } = tokenWithType;
      set(tokenGroupObj, token.name, tokenWithoutName);
    });
    acc[key] = tokenGroupObj;
    return acc;
  }, {});

  return tokenObj;
}
