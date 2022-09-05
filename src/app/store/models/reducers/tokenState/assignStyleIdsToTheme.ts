import { isEqual } from '@/utils/isEqual';
import type { TokenState } from '../../tokenState';

type Payload = {
  id: string
  styleIds: Record<string, string>
};

export function assignStyleIdsToTheme(state: TokenState, data: Payload): TokenState {
  // ignore if the theme does not exist for some reason
  const themeObjectIndex = state.themes.findIndex(({ id }) => data.id === id);
  if (
    themeObjectIndex === -1
    || isEqual(data.styleIds, state.themes[themeObjectIndex].$figmaStyleReferences)
  ) return state;

  const updatedThemes = [...state.themes];
  updatedThemes.splice(themeObjectIndex, 1, {
    ...state.themes[themeObjectIndex],
    $figmaStyleReferences: { ...state.themes[themeObjectIndex].$figmaStyleReferences, ...data.styleIds },
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}
