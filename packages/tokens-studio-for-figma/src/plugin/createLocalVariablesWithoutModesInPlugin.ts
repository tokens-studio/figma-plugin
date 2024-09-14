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
import { findCollectionAndModeIdForTheme } from './findCollectionAndModeIdForTheme';
import { createNecessaryVariableCollections } from './createNecessaryVariableCollections';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';

/**
* This function is used to create variables based on token sets, without the use of themes
* - We first create a "theme container" storing the selected token sets to get closer to theme logic
* - It then creates the necessary variable collections and modes or returns existing ones
* - It then checks if the selected themes generated any collections. It could be a user is in a Free plan and we were unable to create more than 1 mode. If mode wasnt created, we skip the theme.
* - Then goes on to update variables for each theme
* - There's another step that we perform where we check if any variables need to be using references to other variables. This is a second step, as we need to have all variables created first before we can reference them.
* - TODO: Likely a good idea to merge this with createLocalVariablesInPlugin to reduce duplication
* */
export default async function createLocalVariablesWithoutModesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedSets: ExportTokenSet[]) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  const updatedVariableCollections: VariableCollection[] = [];
  let updatedVariables: Variable[] = [];
  const figmaVariablesBeforeCreate = (await getVariablesWithoutZombies()).length;
  const figmaVariableCollectionsBeforeCreate = figma.variables.getLocalVariableCollections().length;

  let figmaVariablesAfterCreate = 0;

  const checkSetting = !settings.variablesBoolean && !settings.variablesColor && !settings.variablesNumber && !settings.variablesString;
  if (!checkSetting) {
    const themesToCreateCollections = selectedSets.reduce((acc: ThemeObject[], curr: ExportTokenSet) => {
      if (curr.status === TokenSetStatus.ENABLED) {
        acc.push({
          selectedTokenSets: {
            [curr.set]: curr.status,
          },
          id: curr.set,
          name: curr.set,
        });
      }
      return acc;
    }, [] as ThemeObject[]);
    const themeContainer = selectedSets.reduce((acc: ThemeObject, curr: ExportTokenSet) => {
      acc.selectedTokenSets = {
        ...acc.selectedTokenSets,
        [curr.set]: curr.status,
      };
      return acc;
    }, {} as ThemeObject);
    const selectedSetIds = selectedSets.map((set) => set.set);

    const collections = await createNecessaryVariableCollections(themesToCreateCollections, selectedSetIds);

    const sourceSets = selectedSets.filter((t) => t.status === TokenSetStatus.SOURCE);
    const sourceTokenSets = sourceSets.reduce((acc, curr) => {
      acc[curr.set] = tokens[curr.set];
      return acc;
    }, {});

    await Promise.all(selectedSets.map(async (set: ExportTokenSet, index) => {
      if (set.status === TokenSetStatus.ENABLED) {
        const setTokens: Record<string, AnyTokenList> = {
          ...sourceTokenSets,
          [set.set]: tokens[set.set],
        };
        const { collection, modeId } = findCollectionAndModeIdForTheme(set.set, set.set, collections);

        if (!collection || !modeId) return;

        const allVariableObj = await updateVariables({
          collection, mode: modeId, theme: themeContainer, tokens: setTokens, settings, filterByTokenSet: set.set,
        });
        figmaVariablesAfterCreate += allVariableObj.removedVariables.length;
        if (Object.keys(allVariableObj.variableIds).length > 0) {
          allVariableCollectionIds[index] = {
            collectionId: collection.id,
            modeId,
            variableIds: allVariableObj.variableIds,
          };
          referenceVariableCandidates = referenceVariableCandidates.concat(allVariableObj.referenceVariableCandidate);
        }
        updatedVariableCollections.push(collection);
      }
    }));
    const existingVariables = await mergeVariableReferencesWithLocalVariables();
    updatedVariables = await updateVariablesToReference(existingVariables, referenceVariableCandidates);
  }

  figmaVariablesAfterCreate += (await getVariablesWithoutZombies())?.length ?? 0;
  const figmaVariableCollectionsAfterCreate = (await figma.variables.getLocalVariableCollectionsAsync())?.length;

  if (figmaVariablesAfterCreate === figmaVariablesBeforeCreate) {
    notifyUI('No variables were created');
  } else {
    notifyUI(`${figmaVariableCollectionsAfterCreate - figmaVariableCollectionsBeforeCreate} collections and ${figmaVariablesAfterCreate - figmaVariablesBeforeCreate} variables created`);
  }
  return {
    allVariableCollectionIds,
    totalVariables: updatedVariables.length,
  };
}
