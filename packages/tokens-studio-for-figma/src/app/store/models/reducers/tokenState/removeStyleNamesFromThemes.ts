import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

export function removeStyleNamesFromThemes(state: TokenState, name: string, parent: string): TokenState {
  const updatedThemes = [...state.themes];
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaStyleReferences;
    if (theme.selectedTokenSets[parent] === TokenSetStatus.ENABLED && updatedTokens) {
      Object.entries(updatedTokens).forEach(([key]) => {
        if (name === key) delete updatedTokens[key];
      });
    }
    theme = {
      ...theme,
      $figmaStyleReferences: updatedTokens,
    };
  });
  return {
    ...state,
    themes: updatedThemes,
  };
}
