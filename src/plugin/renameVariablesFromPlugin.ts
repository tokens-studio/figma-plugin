import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export default async function renameVariablesFromPlugin(tokens: { oldName: string, newName: string }[]) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const renamedVariableToken = tokens.map((token) => {
    const variableIdsToRename: string[] = [];
    const renamedVariableIds: string[] = [];
    themeInfo.themes.forEach((theme) => {
      if (theme.$figmaVariableReferences?.[token.oldName]) {
        variableIdsToRename.push(theme.$figmaVariableReferences?.[token.oldName]);
      }
    });
    variableIdsToRename.forEach((variableId) => {
      const variable = figma.variables.getVariableById(variableId);
      if (variable) {
        variable.name = token.newName.split('.').join('/');
        renamedVariableIds.push(variable.id);
      }
    });
    return {
      ...token,
      variableIds: renamedVariableIds,
    };
  });

  return renamedVariableToken;
}
