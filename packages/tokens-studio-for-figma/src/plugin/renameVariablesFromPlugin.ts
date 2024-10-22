import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { TokenToRename } from '@/types/tokens';
import { getVariablesMap } from '@/utils/getVariablesMap';

export default async function renameVariablesFromPlugin(tokens: TokenToRename[]) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const variableMap = await getVariablesMap();
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
      }
    });
    return {
      ...token,
      variableIds: renamedVariableIds,
    };
  });

  return renamedVariableToken;
}
