import type { TokenState } from '../../tokenState';

export function deleteTheme(state: TokenState, themeId: string): TokenState {
  return {
    ...state,
    themes: state.themes.filter((theme) => theme.id !== themeId),
    activeTheme: state.activeTheme === themeId ? null : state.activeTheme,
  };
}
