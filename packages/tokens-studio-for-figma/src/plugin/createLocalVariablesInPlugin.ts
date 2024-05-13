import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import { notifyUI } from './notifiers';
import { mergeVariableReferencesWithLocalVariables } from './mergeVariableReferences';
import { getOrCreateVariableCollection } from './getOrCreateVariableCollection';
import { ThemeObjectsList } from '@/types';
import createVariableMode from './createVariableMode';

async function createNecessaryVariableCollections(themes: ThemeObjectsList, selectedThemes: string[]) {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

  const collectionsToCreateOrUpdate = themes.filter((theme) => selectedThemes.includes(theme.id));

  console.log('collectionsToCreateOrUpdate', selectedThemes, themes, collectionsToCreateOrUpdate);

  return collectionsToCreateOrUpdate.map((theme) => {
    const nameOfCollection = theme.group ?? theme.name; // If there is a group, use that as the collection name, otherwise use the theme name (e.g. for when creating with sets we use the theme name)
    const existingCollection = allCollections.find((vr) => vr.name === nameOfCollection);
    if (existingCollection) {
      const mode = existingCollection.modes.find((m) => m.name === theme.name);
      if (!mode) createVariableMode(existingCollection, theme.name);
      return existingCollection;
    }
    const newCollection = figma.variables.createVariableCollection(nameOfCollection);
    newCollection.renameMode(newCollection.modes[0].modeId, theme.name);
    return newCollection;
  });
}

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
  let updatedVariables: Variable[] = [];

  const checkSetting = !settings.variablesBoolean && !settings.variablesColor && !settings.variablesNumber && !settings.variablesString;
  if (!checkSetting && selectedThemes && selectedThemes.length > 0) {
    console.log('Theme info', themeInfo);
    console.log('Selected themes', selectedThemes);

    const collections = await createNecessaryVariableCollections(themeInfo.themes, selectedThemes);

    await Promise.all(selectedThemes.map(async (themeId) => {
      const theme = themeInfo.themes.find((t) => t.id === themeId);
      if (!theme) return;
      const { collection, modeId } = getOrCreateVariableCollection(theme.group ?? theme.name, theme.name, collections);

      console.log('Collection', collection, modeId);

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
    }));
    const existingVariables = await mergeVariableReferencesWithLocalVariables(themeInfo.themes);
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
