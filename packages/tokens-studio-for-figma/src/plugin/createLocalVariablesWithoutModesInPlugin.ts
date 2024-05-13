import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import { notifyUI } from './notifiers';
import { ThemeObject } from '@/types';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { mergeVariableReferencesWithLocalVariables } from './mergeVariableReferences';
import { LocalVariableInfo } from './createLocalVariablesInPlugin';
import { getOrCreateVariableCollection } from './getOrCreateVariableCollection';

async function createNecessaryVariableCollectionsFromSets(selectedSets: ExportTokenSet[]) {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

  // TODO: Modes dont work yet. maybe best to merge this with the other function in the other and rely on collections and modes being created before here

  return selectedSets.map((set) => {
    const nameOfCollection = set.set; // Weird name, but set.set is the setname (let's change this!)
    const existingCollection = allCollections.find((vr) => vr.name === nameOfCollection);
    return existingCollection ?? figma.variables.createVariableCollection(nameOfCollection);
  });
}

// This function is used to create variables based on token sets, without the use of themes
export default async function createLocalVariablesWithoutModesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedSets: ExportTokenSet[]) {
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

    const collections = await createNecessaryVariableCollectionsFromSets(selectedSets);

    await Promise.all(selectedSets.map(async (set: ExportTokenSet, index) => {
      if (set.status === TokenSetStatus.ENABLED) {
        const setTokens: Record<string, AnyTokenList> = {
          [set.set]: tokens[set.set],
        };
        const { collection, modeId } = getOrCreateVariableCollection(set.set, set.set, collections);

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
    const existingVariables = await mergeVariableReferencesWithLocalVariables();
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
