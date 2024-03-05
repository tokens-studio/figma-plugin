import type { TokenState } from '../../tokenState';
import { LocalVariableInfo } from '@/plugin/createLocalVariablesInPlugin';

export function assignVariableIdsToTheme(state: TokenState, variableIds: Record<string, LocalVariableInfo>): TokenState {
  const updatedThemes = state.themes.map((theme) => (
    {
      ...theme,
      ...(variableIds[theme.id] && {
        $figmaCollectionId: variableIds[theme.id].collectionId,
        $figmaModeId: variableIds[theme.id].modeId,
        $figmaVariableReferences: variableIds[theme.id].variableIds,
      }),
    }
  ));
  return {
    ...state,
    themes: updatedThemes,
  };
}
