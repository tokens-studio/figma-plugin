import type { TokenState } from '../../tokenState';

export function removeStyleIdsFromThemes(state: TokenState, styleIds: string[]): TokenState {
  const updatedThemes = [...state.themes];
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaStyleReferences;
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([key, styleId]) => {
        if (styleIds.includes(styleId)) delete updatedTokens[key];
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
