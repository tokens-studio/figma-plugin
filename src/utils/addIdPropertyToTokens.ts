import { v4 as uuidv4 } from 'uuid';
import { AnyTokenList } from '@/types/tokens';

export default function addIdpropertyToTokens(tokens: Record<string, AnyTokenList>) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenList>>((acc, [key, val]) => {
    const newTokenList = val.map((token) => {
      if (typeof token.$extensions?.id === 'undefined') {
        return {
          ...token,
          $extensions: {
            ...token.$extensions,
            id: uuidv4(),
          },
        };
      }
      return token;
    });
    acc[key] = newTokenList;
    return acc;
  }, {});

  return tokenObj;
}
