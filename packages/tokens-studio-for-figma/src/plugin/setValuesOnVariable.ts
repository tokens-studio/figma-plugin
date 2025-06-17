import { SingleToken } from '@/types/tokens';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import setStringValuesOnVariable from './setStringValuesOnVariable';
import { convertTokenTypeToVariableType } from '@/utils/convertTokenTypeToVariableType';
import { checkCanReferenceVariable } from '@/utils/alias/checkCanReferenceVariable';
import { TokenTypes } from '@/constants/TokenTypes';
import { transformValue } from './helpers';
import { ProgressTracker } from './ProgressTracker';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { notifyUI, postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';

export type ReferenceVariableType = {
  variable: Variable;
  modeId: string;
  referenceVariable: string;
};

// Helper function to process tokens in batches to prevent memory leaks
async function processBatch(
  batch: SingleToken<true, { path: string, variableId: string }>[],
  variablesInFigma: Variable[],
  collection: VariableCollection,
  mode: string,
  baseFontSize: string,
  shouldRename: boolean,
  variableKeyMap: Record<string, string>,
  referenceVariableCandidates: ReferenceVariableType[],
  renamedVariableKeys: string[],
) {
  await Promise.all(batch.map(async (token) => {
    const variableType = convertTokenTypeToVariableType(token.type, token.value);
    // If id matches the variableId, or name patches the token path, we can use it to update the variable instead of re-creating.
    // This has the nasty side-effect that if font weight changes from string to number, it will not update the variable given we cannot change type.
    // In that case, we should delete the variable and re-create it.
    const variable = variablesInFigma.find((v) => (v.key === token.variableId && !v.remote) || v.name === token.path) || figma.variables.createVariable(token.path, collection, variableType);

    if (variable) {
      // First, rename all variables that should be renamed (if the user choose to do so)
      if (variable.name !== token.path && shouldRename) {
        renamedVariableKeys.push(variable.key);
        variable.name = token.path;
      }
      if (variableType !== variable?.resolvedType) {
        // TODO: There's an edge case where the user had created a variable based on a numerical weight leading to a float variable,
        // if they later change it to a string, we cannot update the variable type. Theoretically we should remove and recreate, but that would lead to broken variables?
        // If we decide to remove, the following would work.
        // variable.remove();
        // variable = figma.variables.createVariable(t.path, collection.id, variableType);
      }
      variable.description = token.description ?? '';

      switch (variableType) {
        case 'BOOLEAN':
          if (typeof token.value === 'string' && !token.value.includes('{')) {
            setBooleanValuesOnVariable(variable, mode, token.value);
          }
          break;
        case 'COLOR':
          if (typeof token.value === 'string' && !token.value.includes('{')) {
            setColorValuesOnVariable(variable, mode, token.value);
          }
          break;
        case 'FLOAT': {
          const value = String(token.value);
          if (typeof value === 'string' && !value.includes('{')) {
            const transformedValue = transformValue(value, token.type, baseFontSize, true);
            setNumberValuesOnVariable(variable, mode, Number(transformedValue));
          }
          break;
        }
        case 'STRING':
          if (typeof token.value === 'string' && !token.value.includes('{')) {
            setStringValuesOnVariable(variable, mode, token.value);
            // Given we cannot determine the combined family of a variable, we cannot use fallback weights from our estimates.
            // This is not an issue because users can set numerical font weights with variables, so we opt-out of the guesswork and just apply the numerical weight.
          } else if (token.type === TokenTypes.FONT_WEIGHTS && Array.isArray(token.value)) {
            setStringValuesOnVariable(variable, mode, token.value[0]);
          }
          break;
        default:
          break;
      }
      let referenceTokenName: string = '';
      if (token.rawValue && token.rawValue?.toString().startsWith('{')) {
        referenceTokenName = token.rawValue?.toString().slice(1, token.rawValue.toString().length - 1);
      } else {
        referenceTokenName = token.rawValue!.toString().substring(1);
      }
      variableKeyMap[token.name] = variable.key;
      if (token && checkCanReferenceVariable(token)) {
        referenceVariableCandidates.push({
          variable,
          modeId: mode,
          referenceVariable: referenceTokenName,
        });
      }
    }
  }));
}

export default async function setValuesOnVariable(
  variablesInFigma: Variable[],
  tokens: SingleToken<true, { path: string, variableId: string }>[],
  collection: VariableCollection,
  mode: string,
  baseFontSize: string,
  shouldRename = false,
) {
  const variableKeyMap: Record<string, string> = {};
  const referenceVariableCandidates: ReferenceVariableType[] = [];
  const renamedVariableKeys: string[] = [];

  // Process tokens in batches to prevent memory leaks with large token sets
  // Use smaller batch sizes for very large token sets to prevent memory issues
  const totalTokens = tokens.length;
  let BATCH_SIZE = 100;
  if (totalTokens > 10000) {
    BATCH_SIZE = 50;
  } else if (totalTokens > 5000) {
    BATCH_SIZE = 75;
  }

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATEPLUGINDATA);

  // Start job tracking
  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: totalTokens,
    },
  });

  try {
    for (let i = 0; i < totalTokens; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);

      await processBatch(
        batch,
        variablesInFigma,
        collection,
        mode,
        baseFontSize,
        shouldRename,
        variableKeyMap,
        referenceVariableCandidates,
        renamedVariableKeys,
      );

      // Update progress tracker
      for (let j = 0; j < batch.length; j += 1) {
        tracker.next();
      }
      tracker.reportIfNecessary();

      // For very large token sets, add longer delays to prevent memory issues
      if (i + BATCH_SIZE < totalTokens) {
        let delay = 10;
        if (totalTokens > 10000) {
          delay = 50;
        } else if (totalTokens > 5000) {
          delay = 25;
        }
        await new Promise<void>((resolve) => {
          setTimeout(resolve, delay);
        });
      }
    }

    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
    });

    if (totalTokens > 1000) {
      notifyUI(`Successfully processed ${totalTokens} tokens!`, { timeout: 2000 });
    }
  } catch (e) {
    console.error('Setting values on variable failed', e);

    // Complete the job even on error
    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.PLUGIN_UPDATEPLUGINDATA,
    });

    notifyUI(`❌ Error processing tokens: ${e}`, { error: true });
  }

  return {
    renamedVariableKeys,
    variableKeyMap,
    referenceVariableCandidates,
  };
}
