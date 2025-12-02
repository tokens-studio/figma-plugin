import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import { notifyUI, postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { ThemeObject } from '@/types';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UsedTokenSetsMap } from '@/types/UsedTokenSetsMap';
import { mergeVariableReferencesWithLocalVariables } from './mergeVariableReferences';
import { LocalVariableInfo } from './createLocalVariablesInPlugin';
import { findCollectionAndModeIdForTheme } from './findCollectionAndModeIdForTheme';
import { createNecessaryVariableCollections } from './createNecessaryVariableCollections';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { generateTokensToCreate } from './generateTokensToCreate';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import { ProgressTracker } from './ProgressTracker';

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

    const selectedSetIds = selectedSets.map((set) => set.set);

    const collections = await createNecessaryVariableCollections(themesToCreateCollections, selectedSetIds);

    // Compute overallConfig once from all selected sets
    const overallConfig = selectedSets.reduce((acc, set) => {
      acc[set.set] = set.status;
      return acc;
    }, {} as UsedTokenSetsMap);

    // Calculate total number of variables for progress tracking
    const totalVariableTokens = selectedSets.reduce((total, set) => {
      if (set.status === TokenSetStatus.ENABLED) {
        const theme = { id: '123', name: set.set, selectedTokenSets: { [set.set]: set.status } };
        const { tokensToCreate } = generateTokensToCreate({
          theme, tokens, overallConfig, filterByTokenSet: set.set,
        });
        const variableTokenCount = tokensToCreate.filter((token) => checkIfTokenCanCreateVariable(token, settings)).length;
        return total + variableTokenCount;
      }
      return total;
    }, 0);

    // Create a single global progress tracker for all variable creation
    let globalProgressTracker: ProgressTracker | null = null;
    if (totalVariableTokens > 10) {
      // First, ensure any previous job is completed to avoid UI counter accumulation
      postToUI({
        type: MessageFromPluginTypes.COMPLETE_JOB,
        name: BackgroundJobs.UI_CREATEVARIABLES,
      });

      // Small delay to ensure UI processes the completion
      await new Promise((resolve) => { setTimeout(resolve, 100); });

      globalProgressTracker = new ProgressTracker(BackgroundJobs.UI_CREATEVARIABLES);
      postToUI({
        type: MessageFromPluginTypes.START_JOB,
        job: {
          name: BackgroundJobs.UI_CREATEVARIABLES,
          timePerTask: 10, // More realistic 10ms per variable token
          totalTasks: totalVariableTokens,
          completedTasks: 0,
        },
      });
    }

    // Process token sets sequentially
    let index = 0;
    for (const set of selectedSets) {
      if (set.status === TokenSetStatus.ENABLED) {
        const { collection, modeId } = findCollectionAndModeIdForTheme(set.set, set.set, collections);

        if (collection && modeId) {
          const allVariableObj = await updateVariables({
            collection,
            mode: modeId,
            theme: { id: '123', name: set.set, selectedTokenSets: { [set.set]: set.status } },
            overallConfig,
            tokens,
            settings,
            filterByTokenSet: set.set,
            progressTracker: globalProgressTracker,
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
        index += 1;
      }
    }

    const existingVariables = await mergeVariableReferencesWithLocalVariables([], themesToCreateCollections);

    // Complete the variable creation job before starting reference updates
    if (totalVariableTokens > 10) {
      postToUI({
        type: MessageFromPluginTypes.COMPLETE_JOB,
        name: BackgroundJobs.UI_CREATEVARIABLES,
      });
    }

    // Update variables to use references instead of raw values
    // This step can be significant with many references, so track progress
    if (referenceVariableCandidates.length > 10) {
      // Start a new progress job for reference updates
      postToUI({
        type: MessageFromPluginTypes.START_JOB,
        job: {
          name: BackgroundJobs.UI_LINK_VARIABLE_REFERENCES,
          timePerTask: 15, // Reference updates are faster than variable creation
          totalTasks: referenceVariableCandidates.length,
          completedTasks: 0,
        },
      });
    }

    updatedVariables = await updateVariablesToReference(existingVariables, referenceVariableCandidates);

    // Complete reference update job
    if (referenceVariableCandidates.length > 10) {
      postToUI({
        type: MessageFromPluginTypes.COMPLETE_JOB,
        name: BackgroundJobs.UI_LINK_VARIABLE_REFERENCES,
      });
    }
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
