import type { TokenState } from '../../tokenState';

type Payload = {
  id: string
  key: string | string[]
};

export function disconnectStyleFromTheme(state: TokenState, data: Payload): TokenState {
  // ignore if the theme does not exist for some reason
  const themeObjectIndex = state.themes.findIndex(({ id }) => data.id === id);
  if (
    themeObjectIndex === -1
    || !state.themes[themeObjectIndex].$figmaStyleReferences
    || (typeof data.key === 'string' && !(data.key in state.themes[themeObjectIndex].$figmaStyleReferences!))
    || (Array.isArray(data.key) && !data.key.some((key) => (key in state.themes[themeObjectIndex].$figmaStyleReferences!)))
  ) return state;

  const updatedThemes = [...state.themes];
  const updatedFigmaStyleReferences = state.themes[themeObjectIndex].$figmaStyleReferences ?? {};
  if (typeof data.key === 'string') {
    delete updatedFigmaStyleReferences[data.key];
  } else {
    data.key.forEach((key) => {
      delete updatedFigmaStyleReferences[key];
    });
  }
  updatedThemes.splice(themeObjectIndex, 1, {
    ...state.themes[themeObjectIndex],
    $figmaStyleReferences: { ...updatedFigmaStyleReferences },
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}
