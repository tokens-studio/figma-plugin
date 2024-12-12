import { TokensToRenamePayload } from '@/app/store/useTokens';
import type { TokenState } from '../../tokenState';

export function renameVariableNamesToThemes(state: TokenState, tokensToRename: TokensToRenamePayload[]): TokenState {
  const oldToNewNameMap = tokensToRename.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.oldName] = curr.newName;
    return acc;
  }, {});
  const newThemes = state.themes.map((theme) => {
    const updatedVariablesReferences = theme.$figmaVariableReferences;
    if (updatedVariablesReferences) {
      Object.entries(updatedVariablesReferences).forEach(([key]) => {
        if (oldToNewNameMap[key]) {
          updatedVariablesReferences[oldToNewNameMap[key]] = updatedVariablesReferences[key];
          delete updatedVariablesReferences[key];
        }
      });
    }
    return {
      ...theme,
      $figmaVariableReferences: updatedVariablesReferences,
    };
  });
  return {
    ...state,
    themes: newThemes,
  };
}
