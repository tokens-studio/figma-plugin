import { TokensToRenamePayload } from '@/app/store/useTokens';
import type { TokenState } from '../../tokenState';

export function renameStyleNamesToCurrentTheme(state: TokenState, tokensToRename: TokensToRenamePayload[]): TokenState {
  const updatedThemes = [...state.themes];
  const oldToNewNameMap = tokensToRename.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.oldName] = curr.newName;
    return acc;
  }, {});
  updatedThemes.forEach((theme) => {
    const updatedTokens = { ...theme.$figmaStyleReferences };
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([key]) => {
        if (oldToNewNameMap[key]) {
          updatedTokens[oldToNewNameMap[key]] = updatedTokens[key];
          delete updatedTokens[key];
        }
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
