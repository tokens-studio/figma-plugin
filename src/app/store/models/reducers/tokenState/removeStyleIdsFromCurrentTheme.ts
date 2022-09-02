import type { TokenState } from '../../tokenState';

export function removeStyleIdsFromCurrentTheme(state: TokenState, styleIds: Record<string, string>): TokenState {
  // ignore if there is no active theme
  if (!state.activeTheme) return state;
  // ignore if the theme does not exist for some reason
  const themeObjectIndex = state.themes.findIndex(({ id }) => state.activeTheme === id);
  if (themeObjectIndex === -1) return state;
  const tokenToRemove = Object.keys(styleIds)[0];
  const updatedTokens = state.themes[themeObjectIndex].$figmaStyleReferences;
  if (updatedTokens) delete updatedTokens[tokenToRemove];
  const updatedThemes = [...state.themes];

  updatedThemes.splice(themeObjectIndex, 1, {
    ...state.themes[themeObjectIndex],
    $figmaStyleReferences: updatedTokens,
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}
