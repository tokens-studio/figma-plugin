import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

export function removeVariableNamesFromThemes(state: TokenState, name: string, parent: string): TokenState {
  const updatedThemes = [...state.themes];
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaVariableReferences;
    if (theme.selectedTokenSets[parent] === TokenSetStatus.ENABLED && updatedTokens) {
      Object.entries(updatedTokens).forEach(([key]) => {
        if (name === key) delete updatedTokens[key];
      });
    }
    theme = {
      ...theme,
      $figmaVariableReferences: updatedTokens,
    };
  });
  return {
    ...state,
    themes: updatedThemes,
  };
}
