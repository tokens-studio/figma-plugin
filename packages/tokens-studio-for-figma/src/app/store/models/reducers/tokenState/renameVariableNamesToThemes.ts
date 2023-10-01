import type { TokenState } from '../../tokenState';

export function renameVariableNamesToThemes(state: TokenState, oldName: string, newName: string): TokenState {
  const newThemes = state.themes.map((theme) => {
    const updatedTokens = theme.$figmaVariableReferences;
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([key]) => {
        if (key === oldName) {
          updatedTokens[newName] = updatedTokens[oldName];
          delete updatedTokens[oldName];
        }
      });
    }
    return {
      ...theme,
      $figmaVariableReferences: updatedTokens,
    };
  });
  return {
    ...state,
    themes: newThemes,
  };
}
