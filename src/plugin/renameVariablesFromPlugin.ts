import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';

export default async function renameVariablesFromPlugin(tokens: { oldName: string, newName: string }[]) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const variableMap = getVariablesMap();
  const renamedVariableToken = tokens.map((token) => {
    const variableIdsToRename: string[] = [];
    const renamedVariableIds: string[] = [];
    themeInfo.themes.forEach((theme) => {
      if (theme.$figmaVariableReferences?.[token.oldName]) {
        variableIdsToRename.push(theme.$figmaVariableReferences?.[token.oldName]);
      }
    });
    variableIdsToRename.forEach((variableId) => {
      const variable = variableMap[variableId];
      if (variable) {
        variable.name = token.newName.split('.').join('/');
        renamedVariableIds.push(variable.key);
      }
    });
    return {
      ...token,
      variableIds: renamedVariableIds,
    };
  });

  return renamedVariableToken;
}
