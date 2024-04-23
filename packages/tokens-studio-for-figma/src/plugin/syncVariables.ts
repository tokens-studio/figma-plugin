import { SettingsState } from '@/app/store/models/settings';
import { SyncVariableOption } from '@/app/store/useTokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  AnyTokenList,
} from '@/types/tokens';
import { getVariablesMap } from '@/utils/getVariablesMap';

export default async function syncVariables(tokens: Record<string, AnyTokenList>, options: Record<SyncVariableOption, boolean>, settings: SettingsState) {
  // Big O (n * Big O(resolveTokenValues))
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const connectedVariablesMap: Record<string, Variable> = {};
  const variableMap = getVariablesMap();
  themeInfo.themes.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([tokenName, variableId]) => {
      const variable = variableMap[variableId];
      const path = tokenName.split('.').join('/');
      // rename
      if (variable) {
        connectedVariablesMap[variableId] = variable;
        if (options.renameVariable && variable.name !== path) {
          variable.name = path;
          const figmaVariable = figma.variables.getVariableById(variableId);
          if (figmaVariable) {
            figmaVariable.name = path;
          }
        }
      }
    });
  });

  const figmaVariables = figma.variables.getLocalVariables();

  // remove
  if (options.removeVariable) {
    figmaVariables.forEach((localVariable) => {
      if (!connectedVariablesMap[localVariable.key]) {
        localVariable.remove();
      }
    });
  }
}
