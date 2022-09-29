import { isEqual } from '@/utils/isEqual';
import type { TokenState } from '../../tokenState';

export function assignStyleIdsToCurrentTheme(state: TokenState, styleIds: Record<string, string>): TokenState {
  // ignore if there is no active theme
  if (!state.activeTheme) return state;
  // ignore if the theme does not exist for some reason
  const themeObjectIndex = state.themes.findIndex(({ id }) => state.activeTheme === id);
  if (
    themeObjectIndex === -1
    || isEqual(styleIds, state.themes[themeObjectIndex].$figmaStyleReferences)
  ) return state;

  const updatedThemes = [...state.themes];
  updatedThemes.splice(themeObjectIndex, 1, {
    ...state.themes[themeObjectIndex],
    $figmaStyleReferences: { ...state.themes[themeObjectIndex].$figmaStyleReferences, ...styleIds },
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}
