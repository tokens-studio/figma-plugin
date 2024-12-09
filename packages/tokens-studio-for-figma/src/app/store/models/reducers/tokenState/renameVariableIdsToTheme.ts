import type { TokenState } from '../../tokenState';

export type RenameVariableToken = {
  oldName: string,
  newName: string,
  variableIds: string[]
};
export function renameVariableIdsToTheme(state: TokenState, variableTokens: RenameVariableToken[]): TokenState {
  const updatedThemes = [...state.themes];
  const variableTokenMap = new Map<string, RenameVariableToken>();
  variableTokens.forEach((token) => variableTokenMap.set(token.oldName, token));
  updatedThemes.forEach((theme) => {
    const updatedTokens = theme.$figmaVariableReferences;
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([key, variableId]) => {
        const renameInfo = variableTokenMap.get(key);
        if (renameInfo && renameInfo.variableIds.includes(variableId)) {
          updatedTokens[renameInfo.newName] = updatedTokens[key];
          delete updatedTokens[key];
        }
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
