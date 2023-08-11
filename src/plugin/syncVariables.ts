import { SettingsState } from '@/app/store/models/settings';
import { SyncVariableOption } from '@/app/store/useTokens';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  AnyTokenList,
} from '@/types/tokens';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import { getVariablesMap } from '@/utils/getVariablesMap';

export default async function syncVariables(tokens: Record<string, AnyTokenList>, options: Record<SyncVariableOption, boolean>, settings: SettingsState) {
  // Big O (n * Big O(resolveTokenValues))
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const connectedVariableIds: string[] = [];
  const variableMap = getVariablesMap();
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  themeInfo.themes.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([tokenName, variableId]) => {
      const variable = variableMap[variableId];
      const path = tokenName.split('.').join('/');
      // rename
      if (options.renameVariable && variable && variable.name !== path) {
        variable.name = path;
      }
      if (variable) {
        connectedVariableIds.push(variableId);
      }
    });
    if (theme.$figmaCollectionId && theme.$figmaModeId) {
      const collection = figma.variables.getVariableCollectionById(theme.$figmaCollectionId);
      if (collection) {
        const allVariableObj = updateVariables({
          collection, mode: theme.$figmaModeId, theme, tokens, settings,
        });
        referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
      }
    }
  });

  const figmaVariables = figma.variables.getLocalVariables();
  updateVariablesToReference(figmaVariables, referenceVariableCandidates);

  // remove
  if (options.removeVariable) {
    figmaVariables.forEach((localVariable) => {
      if (!connectedVariableIds.includes(localVariable.key)) {
        localVariable.remove();
      }
    });
  }
}
