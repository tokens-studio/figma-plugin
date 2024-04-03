import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';
import { notifyUI } from './notifiers';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};
export default async function createLocalVariablesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedThemes?: string[]) {
  console.log('creating local variables in plugin');
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  let updatedVariableCollections;

  const checkSetting = !settings.variablesBoolean && !settings.variablesColor && !settings.variablesNumber && !settings.variablesString;
  if (!checkSetting) {
    themeInfo.themes.forEach(async (theme) => {
      if (!selectedThemes || (selectedThemes && selectedThemes.includes(theme.id))) {
        console.log('Creating variables for theme', theme.name);
        const collection = figma.variables.getLocalVariableCollections().find((vr) => vr.name === (theme.group ?? theme.name));
        if (collection) {
          const mode = collection.modes.find((m) => m.name === theme.name);
          const modeId: string = mode?.modeId ?? createVariableMode(collection, theme.name);
          if (modeId) {
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
        } else {
          const newCollection = figma.variables.createVariableCollection(theme.group ?? theme.name);
          newCollection.renameMode(newCollection.modes[0].modeId, theme.name);
          const allVariableObj = await updateVariables({
            collection: newCollection, mode: newCollection.modes[0].modeId, theme, tokens, settings,
          });
          if (Object.keys(allVariableObj.variableIds).length > 0) {
            allVariableCollectionIds[theme.id] = {
              collectionId: newCollection.id,
              modeId: newCollection.modes[0].modeId,
              variableIds: allVariableObj.variableIds,
            };
            referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
          }
          updatedVariableCollections.push(newCollection);
        }
      }
    });
  }
  const figmaVariables = figma.variables.getLocalVariables();

  const updatedVariables = await updateVariablesToReference(figmaVariables, referenceVariableCandidates);
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
