import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';

export default async function renameVariablesFromPlugin(tokens: { oldName: string, newName: string }[]) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const variableMap = getVariablesMap();
  console.log('tokens', tokens);
  const renamedVariableToken = tokens.map((token) => {
    const renamedVariableIds: string[] = [];
    const originalVariableIdsToRename = themeInfo.themes.reduce<string[]>((acc, theme) => {
      console.log('theme', theme);
      if (theme.$figmaVariableReferences?.[token.newName]) {
        acc.push(theme.$figmaVariableReferences?.[token.newName]);
      }
      return acc;
    }, []);
    console.log('originalVariableIdsToRename', originalVariableIdsToRename);
    originalVariableIdsToRename.forEach((variableId) => {
      const variable = variableMap[variableId];
      if (variable) {
        variable.name = token.newName.split('.').join('/');
        console.log('varialbe', variable);
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
