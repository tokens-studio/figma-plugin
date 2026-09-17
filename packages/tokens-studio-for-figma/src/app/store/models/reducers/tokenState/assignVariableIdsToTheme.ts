import type { TokenState } from '../../tokenState';
import { LocalVariableInfo } from '@/plugin/createLocalVariablesInPlugin';

export function assignVariableIdsToTheme(state: TokenState, variableIds: Record<string, LocalVariableInfo>): TokenState {
  const updatedThemes = state.themes.map((theme) => {
    if (!variableIds[theme.id]) return theme;
    const incoming = variableIds[theme.id].variableIds;
    // Merge into the previous map so existing entries keep their original key order
    // and only truly new tokens get appended at the end. Replacing wholesale would
    // shuffle themes.json every export (issue #3791).
    const merged: Record<string, string> = { ...(theme.$figmaVariableReferences ?? {}) };
    Object.keys(incoming).forEach((key) => {
      merged[key] = incoming[key];
    });
    return {
      ...theme,
      $figmaCollectionId: variableIds[theme.id].collectionId,
      $figmaModeId: variableIds[theme.id].modeId,
      $figmaVariableReferences: merged,
    };
  });
  return {
    ...state,
    themes: updatedThemes,
  };
}
