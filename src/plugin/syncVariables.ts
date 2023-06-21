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

export default async function syncVariables(tokens: Record<string, AnyTokenList>, options: Record<SyncVariableOption, boolean>, settings: SettingsState) {
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const connectedVariableIds: string[] = [];
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  themeInfo.themes.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([tokenName, variableId]) => {
      const variable = figma.variables.getVariableById(variableId);
      const path = tokenName.split('.').join('/');
      // rename
      if (options.renameVariable && variable && variable.name !== path) {
        variable.name = path;
      }
      connectedVariableIds.push(variableId);
    });
    if (theme.$figmaCollectionId && theme.$figmaModeId) {
      const collection = figma.variables.getVariableCollectionById(theme.$figmaCollectionId);
      if (collection) {
        const allVariableObj = updateVariables({
          collection, mode: theme.$figmaModeId, theme, tokens, settings, shouldCreate: false,
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
      if (!connectedVariableIds.includes(localVariable.id)) {
        localVariable.remove();
      }
    });
  }
}
