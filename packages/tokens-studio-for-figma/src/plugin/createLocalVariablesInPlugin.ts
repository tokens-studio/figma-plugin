import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import { notifyUI } from './notifiers';
import { mergeVariableReferencesWithLocalVariables } from './mergeVariableReferences';
import { findCollectionAndModeIdForTheme } from './findCollectionAndModeIdForTheme';
import { createNecessaryVariableCollections } from './createNecessaryVariableCollections';

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
    const collections = await createNecessaryVariableCollections(themeInfo.themes, selectedThemes);

    await Promise.all(selectedThemes.map(async (themeId) => {
      const theme = themeInfo.themes.find((t) => t.id === themeId);
      if (!theme) return;
      const { collection, modeId } = findCollectionAndModeIdForTheme(theme.group ?? theme.name, theme.name, collections);

      // If we dont have a collection or modeId, we skip this theme
      // This could be because the user is in a free Figma plan and we werent able to create more than 1 mode
      if (!collection || !modeId) return;

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
