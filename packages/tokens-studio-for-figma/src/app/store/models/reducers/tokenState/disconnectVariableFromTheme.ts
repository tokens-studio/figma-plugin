import type { TokenState } from '../../tokenState';

type Payload = {
  id: string
  key: string | string[]
};

export function disconnectVariableFromTheme(state: TokenState, data: Payload): TokenState {
  const themeObjectIndex = state.themes.findIndex(({ id }) => data.id === id);
  if (
    themeObjectIndex === -1
    || !state.themes[themeObjectIndex].$figmaVariableReferences
  ) return state;

  const updatedThemes = [...state.themes];
  const updatedFigmaVariableReferences = { ...(state.themes[themeObjectIndex].$figmaVariableReferences ?? {}) };
  if (typeof data.key === 'string') {
    delete updatedFigmaVariableReferences[data.key];
  } else {
    data.key.forEach((key) => {
      delete updatedFigmaVariableReferences[key];
    });
  }
  updatedThemes.splice(themeObjectIndex, 1, {
    ...state.themes[themeObjectIndex],
    $figmaVariableReferences: { ...updatedFigmaVariableReferences },
  });

  return {
    ...state,
    themes: updatedThemes,
  };
}
