import omit from 'just-omit';
import type { TokenState } from '../../tokenState';

export function deleteTheme(state: TokenState, themeId: string): TokenState {
  // @TODO update for array type
  return {
    ...state,
    themes: omit({ ...state.themes }, themeId),
    activeTheme: state.activeTheme === themeId ? null : state.activeTheme,
  };
}
