import { TokensToRenamePayload } from '@/app/store/useTokens';
import type { TokenState } from '../../tokenState';

export function renameStyleIdsToCurrentTheme(state: TokenState, styleIds: string[], tokensToRename: TokensToRenamePayload[]): TokenState {
  const updatedThemes = [...state.themes];
  const oldToNewNameMap = tokensToRename.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.oldName] = curr.newName;
    return acc;
  }, {});
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaStyleReferences;
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([oldName, styleId]) => {
        if (styleIds.includes(styleId) && oldToNewNameMap[oldName]) {
          updatedTokens[oldToNewNameMap[oldName]] = updatedTokens[oldName];
          delete updatedTokens[oldName];
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
