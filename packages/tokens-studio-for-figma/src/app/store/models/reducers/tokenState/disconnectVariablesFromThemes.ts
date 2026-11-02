import type { TokenState } from '../../tokenState';

// Batched version of disconnectVariableFromTheme: theme id -> token names to unlink.
export function disconnectVariablesFromThemes(state: TokenState, data: Record<string, string[]>): TokenState {
  return {
    ...state,
    themes: state.themes.map((theme) => {
      const names = data[theme.id];
      if (!names?.length || !theme.$figmaVariableReferences) return theme;
      const updatedReferences = { ...theme.$figmaVariableReferences };
      names.forEach((name) => {
        delete updatedReferences[name];
      });
      return { ...theme, $figmaVariableReferences: updatedReferences };
    }),
  };
}
