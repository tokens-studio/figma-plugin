import type { AnyTokenList, SingleToken } from '@/types/tokens';
import { updateAliasesInState } from '@/app/store/utils/updateAliasesInState';
import type { TokenRename } from './findRenamedVariableTokens';

export type UpdatedReference = { set: string; name: string; value: SingleToken['value'] };

// Renames the tokens of renamed variables and points references to them at the new name. `updatedReferences`
// lists the tokens whose value changed with it, by the name they had before.
export function renameVariableTokens(
  previousTokens: Record<string, AnyTokenList>,
  renames: TokenRename[],
): { tokens: Record<string, AnyTokenList>; updatedReferences: UpdatedReference[] } {
  const tokens = { ...previousTokens };
  const originalNames = new Map<SingleToken, string>();
  const renamed: TokenRename[] = [];

  renames.forEach((rename) => {
    const { set, oldName, newName } = rename;
    const setTokens = tokens[set];
    if (!setTokens?.some((token) => token.name === oldName) || setTokens.some((token) => token.name === newName)) return;
    renamed.push(rename);
    tokens[set] = setTokens.map((token) => {
      if (token.name !== oldName) return token;
      const renamedToken = { ...token, name: newName } as SingleToken;
      originalNames.set(renamedToken, oldName);
      return renamedToken;
    });
  });
  if (renamed.length === 0) return { tokens, updatedReferences: [] };

  // While another set still has a token with the old name, a reference to it may mean that one.
  const remainingNames = new Set(Object.values(tokens).flatMap((setTokens) => setTokens.map((token) => token.name)));
  const newNames = new Map<string, Set<string>>();
  renamed.forEach(({ oldName, newName }) => {
    newNames.set(oldName, (newNames.get(oldName) ?? new Set()).add(newName));
  });
  const referenceRenames = [...newNames]
    .filter(([oldName, names]) => names.size === 1 && !remainingNames.has(oldName))
    .map(([oldName, names]) => ({ oldName, newName: [...names][0] }));

  const updatedReferences: UpdatedReference[] = [];
  Object.entries(tokens).forEach(([set, setTokens]) => {
    let changed = false;
    const updatedTokens = setTokens.map((token) => {
      const content = JSON.stringify([token.value, token.$extensions]);
      if (!/[{$]/.test(content)) return token;
      const updated = referenceRenames
        .filter(({ oldName }) => content.includes(oldName))
        .reduce<SingleToken>((current, rename) => {
        const result = updateAliasesInState({ [set]: [current] }, rename);
        return result.updatedSets.length > 0 ? result.updatedTokens[set][0] : current;
      }, token);
      if (updated === token) return token;
      changed = true;
      if (JSON.stringify(updated.value) !== JSON.stringify(token.value)) {
        updatedReferences.push({ set, name: originalNames.get(token) ?? token.name, value: updated.value });
      }
      return updated;
    });
    if (changed) tokens[set] = updatedTokens;
  });
  return { tokens, updatedReferences };
}
