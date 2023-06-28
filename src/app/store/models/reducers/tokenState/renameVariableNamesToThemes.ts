import type { TokenState } from '../../tokenState';

export function renameVariableNamesToThemes(state: TokenState, oldName: string, newName: string): TokenState {
  const updatedThemes = [...state.themes];
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaVariableReferences;
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([key]) => {
        if (key === oldName) {
          updatedTokens[newName] = updatedTokens[oldName];
          delete updatedTokens[oldName];
        }
      });
    }
    theme = {
      ...theme,
      $figmaVariableReferences: updatedTokens,
    };
  });
  return {
    ...state,
    themes: updatedThemes,
  };
}
