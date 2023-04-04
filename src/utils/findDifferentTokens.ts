import { AnyTokenList, ImportToken } from '@/types/tokens';
import { isEqual } from './isEqual';

export function findDifferentTokens(baseTokens: Record<string, AnyTokenList>, compareTokens: Record<string, AnyTokenList>): Record<string, AnyTokenList> {
  const entries: [string, ImportToken[]][] = [];
  Object.entries(compareTokens).forEach(([tokenSet, values]) => {
    const newTokens: ImportToken[] = [];
    const updatedTokens: ImportToken[] = [];
    const removedTokens: ImportToken[] = [];
    // Find created tokens and updated tokens
    values.forEach((token) => {
      const oldValue = baseTokens[tokenSet].find((t) => t.name === token.name);
      if (oldValue) {
        if (!isEqual(oldValue.value, token.value)) {
          const updatedToken: ImportToken = { ...token };
          updatedToken.oldValue = oldValue.value;
          updatedToken.importType = 'UPDATE';
          updatedTokens.push(updatedToken);
        }
        if (!isEqual(oldValue.description, token.description)) {
          updatedTokens.push({
            ...token,
            oldDescription: oldValue.description,
            importType: 'UPDATE',
          });
        }
      } else {
        newTokens.push({ ...token, importType: 'NEW' });
      }
    });
    // Find the removed tokens
    baseTokens[tokenSet].forEach((token) => {
      const oldValue = compareTokens[tokenSet].find((t) => t.name === token.name);
      if (!oldValue) {
        removedTokens.push({ ...token, importType: 'REMOVE' });
      }
    });
    const totalUpdatedTokens = [...newTokens, ...updatedTokens, ...removedTokens];
    entries.push([tokenSet, totalUpdatedTokens]);
  });

  // Find the tokens in removed tokenSet
  Object.entries(baseTokens).forEach(([tokenSet, values]) => {
    const isTokenSetRemoved = typeof compareTokens[tokenSet] === 'undefined';
    if (isTokenSetRemoved) {
      entries.push([tokenSet, values.map((token) => ({ ...token, importType: 'REMOVE' }))]);
    }
  });

  return Object.fromEntries(entries);
}
