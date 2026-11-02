import type { TokenState } from '../../tokenState';

// Re-adds variable references (theme id -> token name -> variable key) that are missing,
// e.g. after an export dropped them because the token can no longer create a variable.
// Existing references are left untouched.
export function restoreVariableReferencesToThemes(state: TokenState, data: Record<string, Record<string, string>>): TokenState {
  return {
    ...state,
    themes: state.themes.map((theme) => {
      const references = data[theme.id];
      if (!references) return theme;
      const missing = Object.entries(references).filter(([name]) => !theme.$figmaVariableReferences?.[name]);
      if (missing.length === 0) return theme;
      return {
        ...theme,
        $figmaVariableReferences: { ...theme.$figmaVariableReferences, ...Object.fromEntries(missing) },
      };
    }),
  };
}
