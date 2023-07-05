import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';

export default async function renameVariablesFromPlugin(tokens: { oldName: string, newName: string }[]) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const variableMap = getVariablesMap();
  const referenceVariableValues: Record<string, [string, string][]> = {}; // stores variableId to aliasVariableValue map {"variable-123" : [["variable-234", "mode-1"], ["variable-235", "mode-2"]]}
  figma.variables.getLocalVariables().forEach((v) => {
    Object.entries(v.valuesByMode).forEach(([mode, variableValue]) => {
      if (typeof variableValue === 'object' && 'type' in variableValue && variableValue.type === 'VARIABLE_ALIAS') {
        if (!referenceVariableValues[variableValue.id]) {
          referenceVariableValues[variableValue.id] = [];
        }
        referenceVariableValues[variableValue.id].push([v.id, mode]);
      }
    });
  });

  const renamedVariableToken = tokens.map((token) => {
    const renamedVariableIds: string[] = [];
    const originalVariableIdsToRename = themeInfo.themes.reduce<string[]>((acc, theme) => {
      if (theme.$figmaVariableReferences?.[token.newName]) {
        acc.push(theme.$figmaVariableReferences?.[token.newName]);
      }
      return acc;
    }, []);
    originalVariableIdsToRename.forEach((variableId) => {
      const variable = variableMap[variableId];
      if (variable) {
        variable.name = token.newName.split('.').join('/');
        renamedVariableIds.push(variable.key);
        if (referenceVariableValues[variable.id]?.length > 0) {
          // Update variables which reference this variable
          referenceVariableValues[variable.id].forEach(([variableIdToUpdate, mode]) => {
            const variableToUpdate = figma.variables.getVariableById(variableIdToUpdate);
            if (variableToUpdate) {
              variableToUpdate.setValueForMode(mode, {
                type: 'VARIABLE_ALIAS',
                id: variable.id,
              });
              renamedVariableIds.push(variableToUpdate.key);
            }
          });
        }
      }
    });
    return {
      ...token,
      variableIds: renamedVariableIds,
    };
  });

  return renamedVariableToken;
}
