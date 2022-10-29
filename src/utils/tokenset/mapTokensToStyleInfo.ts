import type { AnyTokenList, SingleToken } from '@/types/tokens';
import { matchStyleName } from '../matchStyleName';

export function mapTokensToStyleInfo(
  values: Record<string, AnyTokenList>,
  figmaStyleReferences: Record<string, string>,
  convertTokenNameToPath: (name: string) => string, // @README this is here for the beta users - only because we used to store the pathname in the figmaStyleRefs of a theme
) {
  const map: Record<string, {
    styleId: string,
    token: SingleToken
  }> = {};

  const entries = Object.entries(values);
  entries.forEach(([,tokens]) => {
    tokens.forEach((token) => {
      const tokenpath = convertTokenNameToPath(token.name);
      const matchedStyleId = matchStyleName(token.name, tokenpath, figmaStyleReferences);
      if (matchedStyleId) {
        map[token.name] = {
          styleId: matchedStyleId,
          token,
        };
      }
    });
  });

  return map;
}
