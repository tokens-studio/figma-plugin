import omit from 'just-omit';
import type { TokenState } from '../../tokenState';

type Payload = {
  id: string
  key: string
};

export function disconnectStyleFromTheme(state: TokenState, data: Payload): TokenState {
  // ignore if the theme does not exist for some reason
  const themeObjectIndex = state.themes.findIndex(({ id }) => data.id === id);
  if (
    themeObjectIndex === -1
    || !state.themes[themeObjectIndex].$figmaStyleReferences
    || !(data.key in state.themes[themeObjectIndex].$figmaStyleReferences!)
  ) return state;

  const updatedThemes = [...state.themes];
  updatedThemes.splice(themeObjectIndex, 1, {
    ...state.themes[themeObjectIndex],
    $figmaStyleReferences: omit(state.themes[themeObjectIndex].$figmaStyleReferences ?? {}, data.key),
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}
