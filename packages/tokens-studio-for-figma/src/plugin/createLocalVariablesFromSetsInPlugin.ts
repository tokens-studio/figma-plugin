import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import createVariableMode from './createVariableMode';
import { notifyUI } from './notifiers';
import { ThemeObject } from '@/types';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { mergeVariableReferences } from './mergeVariableReferences';
import { LocalVariableInfo } from './createLocalVariablesInPlugin';

// This function is used to create variables based on token sets, without the use of themes
export default async function createLocalVariablesFromSetsInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedSets: ExportTokenSet[]) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  const updatedVariableCollections: VariableCollection[] = [];
  let updatedVariables: Variable[] = [];

  const checkSetting = !settings.variablesBoolean && !settings.variablesColor && !settings.variablesNumber && !settings.variablesString;
  if (!checkSetting) {
    const themeContainer = selectedSets.reduce((acc: ThemeObject, curr: ExportTokenSet) => {
      acc.selectedTokenSets = {
        ...acc.selectedTokenSets,
        [curr.set]: curr.status,
      };
      return acc;
    }, {} as ThemeObject);
    await Promise.all(selectedSets.map(async (set: ExportTokenSet, index) => {
      if (set.status === TokenSetStatus.ENABLED) {
        const setTokens: Record<string, AnyTokenList> = {
          [set.set]: tokens[set.set],
        };
        const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
        let collection = allCollections.find((vr) => vr.name === set.set);
        let modeId;
        if (collection) {
          const mode = collection.modes.find((m) => m.name === set.set);
          modeId = mode?.modeId ?? createVariableMode(collection, set.set);
        } else {
          collection = figma.variables.createVariableCollection(set.set);
          collection.renameMode(collection.modes[0].modeId, set.set);
          modeId = collection.modes[0].modeId;
        }

        const allVariableObj = await updateVariables({
          collection, mode: modeId, theme: themeContainer, tokens: setTokens, settings, filterByTokenSet: set.set,
        });
        if (Object.keys(allVariableObj.variableIds).length > 0) {
          allVariableCollectionIds[index] = {
            collectionId: collection.id,
            modeId,
            variableIds: allVariableObj.variableIds,
          };
          referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
        }
      }
    }));
    const figmaVariables = await figma.variables.getLocalVariablesAsync();
    const existingVariables = await mergeVariableReferences({ localVariables: figmaVariables });
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
