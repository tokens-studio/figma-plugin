import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';
import { notifyUI } from './notifiers';
import { mergeVariableReferences } from './mergeVariableReferences';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
// This function is used to create variables based on themes
export default async function createLocalVariablesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedThemes?: string[]) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  const updatedVariableCollections: VariableCollection[] = [];
  let updatedVariables;

  const checkSetting = !settings.variablesBoolean && !settings.variablesColor && !settings.variablesNumber && !settings.variablesString;
  if (!checkSetting) {
    await Promise.all(themeInfo.themes.map(async (theme) => {
      if (selectedThemes?.includes(theme.id)) {
        let collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === (theme.group ?? theme.name));
        let modeId;
        if (collection) {
          const mode = collection.modes.find((m) => m.name === theme.name);
          modeId = mode?.modeId ?? createVariableMode(collection, theme.name);
        } else {
          collection = figma.variables.createVariableCollection(theme.group ?? theme.name);
          collection.renameMode(collection.modes[0].modeId, theme.name);
          modeId = collection.modes[0].modeId;
        }

        const allVariableObj = await updateVariables({
          collection, mode: modeId, theme, tokens, settings,
        });
        if (Object.keys(allVariableObj.variableIds).length > 0) {
          allVariableCollectionIds[theme.id] = {
            collectionId: collection.id,
            modeId,
            variableIds: allVariableObj.variableIds,
          };
          referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
        }
        updatedVariableCollections.push(collection);
      }
    }));
    const figmaVariables = await figma.variables.getLocalVariablesAsync();
    const existingVariables = await mergeVariableReferences({ themes: themeInfo.themes, localVariables: figmaVariables });
    updatedVariables = await updateVariablesToReference(existingVariables, referenceVariableCandidates);
  }
  if (updatedVariables.length === 0) {
    notifyUI('No variables were created');
  } else {
    notifyUI(`${updatedVariableCollections.length} collections and ${updatedVariables.length} variables created`);
  }
  return {
    allVariableCollectionIds,
    totalVariables: updatedVariables.length,
  };
}
