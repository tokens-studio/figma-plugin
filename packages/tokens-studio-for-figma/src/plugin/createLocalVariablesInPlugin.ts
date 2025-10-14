import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import updateVariables from './updateVariables';
import { ReferenceVariableType } from './setValuesOnVariable';
import updateVariablesToReference from './updateVariablesToReference';
import { notifyUI, postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { mergeVariableReferencesWithLocalVariables } from './mergeVariableReferences';
import { findCollectionAndModeIdForTheme } from './findCollectionAndModeIdForTheme';
import { createNecessaryVariableCollections } from './createNecessaryVariableCollections';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { getOverallConfig } from '@/utils/tokenHelpers';
import { generateTokensToCreate } from './generateTokensToCreate';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import { ProgressTracker } from './ProgressTracker';

export type LocalVariableInfo = {
  collectionId: string;
  modeId: string;
  variableIds: Record<string, string>
};

/**
* This function is used to create and update variables based on themes
* - It first creates the necessary variable collections and modes or returns existing ones
* - It then checks if the selected themes generated any collections. It could be a user is in a Free plan and we were unable to create more than 1 mode. If mode wasnt created, we skip the theme.
* - Then goes on to update variables for each theme
* - There's another step that we perform where we check if any variables need to be using references to other variables. This is a second step, as we need to have all variables created first before we can reference them.
* */
export default async function createLocalVariablesInPlugin(tokens: Record<string, AnyTokenList>, settings: SettingsState, selectedThemes?: string[]) {
  // Big O (n * m * x): (n: amount of themes, m: amount of variableCollections, x: amount of modes)
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const selectedThemeObjects = themeInfo.themes.filter((theme) => selectedThemes?.includes(theme.id));
  const allVariableCollectionIds: Record<string, LocalVariableInfo> = {};
  let referenceVariableCandidates: ReferenceVariableType[] = [];
  const updatedVariableCollections: VariableCollection[] = [];
  let updatedVariables: Variable[] = [];
  const figmaVariablesBeforeCreate = (await getVariablesWithoutZombies())?.length;
  const figmaVariableCollectionsBeforeCreate = figma.variables.getLocalVariableCollections()?.length;

  let figmaVariablesAfterCreate = 0;

  const checkSetting = !settings.variablesBoolean && !settings.variablesColor && !settings.variablesNumber && !settings.variablesString;
  if (!checkSetting && selectedThemes && selectedThemes.length > 0) {
    // Show preparation phase
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.UI_PREPARING_VARIABLES,
        isInfinite: true,
      },
    });

    const overallConfig = getOverallConfig(themeInfo.themes, selectedThemes);
    const collections = await createNecessaryVariableCollections(themeInfo.themes, selectedThemes);

    // Calculate total number of variables for progress tracking
    const totalVariableTokens = selectedThemeObjects.reduce((total, theme) => {
      const themeTokens = generateTokensToCreate({ theme, tokens, overallConfig });
      const variableTokenCount = themeTokens.filter((token) => checkIfTokenCanCreateVariable(token, settings)).length;
      return total + variableTokenCount;
    }, 0);

    // Complete preparation phase
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.UI_PREPARING_VARIABLES,
    });

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

    // Process themes sequentially
    for (const theme of selectedThemeObjects) {
      const { collection, modeId } = findCollectionAndModeIdForTheme(theme.group ?? theme.name, theme.name, collections);

      if (collection && modeId) {
        // Use overallConfig to allow cross-theme token references
        const allVariableObj = await updateVariables({
          collection, mode: modeId, theme, tokens, settings, overallConfig, progressTracker: globalProgressTracker,
        });

        figmaVariablesAfterCreate += allVariableObj.removedVariables.length;
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
    }
    // Gather references that we should use. Merge current theme references with the ones from all themes as well as local variables
    const existingVariables = await mergeVariableReferencesWithLocalVariables(selectedThemeObjects, themeInfo.themes);

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
  const figmaVariableCollectionsAfterCreate = figma.variables.getLocalVariableCollections()?.length;

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
