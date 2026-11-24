import type { ThemeObjectsList } from '@/types';
import { isThemeOwnTokenSet } from '@/utils/isThemeOwnTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type TokenRename = { set: string; oldName: string; newName: string };

// A theme imported from a Figma mode maps each token name to its variable's key. When the same key comes back
// under another name, the variable was renamed. Returns the renamed tokens per set, by the set's new name.
export function findRenamedVariableTokens(previousThemes: ThemeObjectsList | undefined, updatedThemes: ThemeObjectsList | undefined): TokenRename[] {
  const renames: TokenRename[] = [];
  (updatedThemes || []).forEach((theme) => {
    const previous = (previousThemes || []).find((t) => t.id === theme.id);
    const previousReferences = previous?.$figmaVariableReferences;
    const references = theme.$figmaVariableReferences;
    if (!previousReferences || !references || Array.isArray(previousReferences) || Array.isArray(references)) return;

    const previousNameByKey = new Map(Object.entries(previousReferences).map(([name, key]) => [key, name]));
    const sets = Object.entries(theme.selectedTokenSets || {})
      // The theme can use other sets too. Their tokens aren't this mode's variables, even under the same name.
      .filter(([set, status]) => status === TokenSetStatus.ENABLED && isThemeOwnTokenSet(set, theme))
      .map(([set]) => set);

    Object.entries(references).forEach(([newName, key]) => {
      const oldName = previousNameByKey.get(key);
      // A name that is still in use belongs to another variable now, which a rename can't express.
      if (!oldName || oldName === newName || oldName in references) return;
      sets.forEach((set) => renames.push({ set, oldName, newName }));
    });
  });
  return renames;
}
