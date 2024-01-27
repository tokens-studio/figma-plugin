import { v4 as uuidv4 } from 'uuid';
import { AnyTokenList } from '@/types/tokens';

export default function addIdPropertyToTokens(tokens: Record<string, AnyTokenList>) {
  const tokenObj = Object.entries(tokens).reduce<Record<string, AnyTokenList>>((acc, [key, val]) => {
    const newTokenList = val.map((token) => {
      if (typeof token.$extensions?.['studio.tokens']?.id === 'undefined') {
        const extensionsObj = {
          ...token.$extensions,
          'studio.tokens': {
            ...token?.$extensions?.['studio.tokens'],
            id: uuidv4(),
          },
        };
        return {
          ...token,
          // Only when extensions obj is not empty do we set it again
          ...(Object.entries(extensionsObj).length > 0 ? {
            $extensions: {
              ...token.$extensions,
              'studio.tokens': {
                ...token?.$extensions?.['studio.tokens'],
                id: uuidv4(),
              },
            },
          } : {}),
        };
      }
      return token;
    });
    acc[key] = newTokenList;
    return acc;
  }, {});

  return tokenObj;
}
