import type { TokenState } from '../../tokenState';

export function deleteTheme(state: TokenState, themeId: string): TokenState {
  const newActiveTheme = state.activeTheme;
  Object.keys(newActiveTheme).forEach((group) => {
    if (newActiveTheme[group] === themeId) {
      delete newActiveTheme[group];
    }
  });

  return {
    ...state,
    themes: state.themes.filter((theme) => theme.id !== themeId),
    activeTheme: newActiveTheme,
  };
}
