import type { TokenState } from '../../tokenState';
import { LocalVariableInfo } from '@/plugin/createLocalVariablesInPlugin';

export function assignVariableIdsToTheme(state: TokenState, variableIds: Record<string, LocalVariableInfo>): TokenState {
  const updatedThemes = state.themes.map((theme) => {
    if (!variableIds[theme.id]) return theme;
    const incoming = variableIds[theme.id].variableIds;
    // Rebuild in the previous map's key order so themes.json stays stable across exports,
    // keeping only tokens the export still produced — entries dropped here belong to tokens
    // that no longer exist, whose Figma variables may already have been removed.
    const previous = theme.$figmaVariableReferences ?? {};
    const merged: Record<string, string> = {};
    Object.keys(previous).forEach((key) => {
      if (key in incoming) merged[key] = incoming[key];
    });
    Object.keys(incoming).forEach((key) => {
      if (!(key in merged)) merged[key] = incoming[key];
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
