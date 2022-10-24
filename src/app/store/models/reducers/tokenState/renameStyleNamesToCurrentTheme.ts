import type { TokenState } from '../../tokenState';

export function renameStyleNamesToCurrentTheme(state: TokenState, oldName: string, newName: string): TokenState {
  const updatedThemes = [...state.themes];
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaStyleReferences;
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
      $figmaStyleReferences: updatedTokens,
    };
  });
  return {
    ...state,
    themes: updatedThemes,
  };
}
