import type { TokenState } from '../../tokenState';

export function renameStyleIdsToCurrentTheme(state: TokenState, styleIds: string[], newName: string): TokenState {
  const updatedThemes = [...state.themes];
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaStyleReferences;
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([key, styleId]) => {
        if (styleIds.includes(styleId)) {
          updatedTokens[newName] = updatedTokens[key];
          delete updatedTokens[key];
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
