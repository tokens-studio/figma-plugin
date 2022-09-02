import type { TokenState } from '../../tokenState';

export function renameStyleIdsToCurrentTheme(state: TokenState, oldName: string, newName: string): TokenState {
  // ignore if there is no active theme
  if (!state.activeTheme) return state;

  // ignore if the theme does not exist for some reason
  const themeObjectIndex = state.themes.findIndex(({ id }) => state.activeTheme === id);
  if (themeObjectIndex === -1) return state;

  const updatedThemes = [...state.themes];
  const updatedTokens = state.themes[themeObjectIndex].$figmaStyleReferences;
  if (updatedTokens) {
    updatedTokens[newName] = updatedTokens[oldName];
    delete updatedTokens[oldName];
  }
  updatedThemes.splice(themeObjectIndex, 1, {
    ...state.themes[themeObjectIndex],
    $figmaStyleReferences: updatedTokens,
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}
