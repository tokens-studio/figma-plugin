import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

export function removeVariableNamesFromThemes(state: TokenState, name: string, parent: string): TokenState {
  const newThemes = state.themes.map((theme) => {
    const updatedTokens = { ...theme.$figmaVariableReferences };
    if (theme.selectedTokenSets[parent] === TokenSetStatus.ENABLED && updatedTokens) {
      Object.entries(updatedTokens).forEach(([key]) => {
        if (name === key) delete updatedTokens[key];
      });
    }
    return {
      ...theme,
      $figmaVariableReferences: updatedTokens,
    };
  });
  return {
    ...state,
    themes: newThemes,
  };
}
