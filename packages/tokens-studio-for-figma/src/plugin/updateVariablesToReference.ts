import { ReferenceVariableType } from './setValuesOnVariable';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { processBatches } from '@/utils/processBatches';

export default async function updateVariablesToReference(figmaVariables: Map<string, string>, referenceVariableCandidates: ReferenceVariableType[]): Promise<Variable[]> {
  const updatedVariables: Variable[] = [];

  console.log('[REF UPDATE] Getting all local variables...');
  // Get all local variables to enable collection-aware lookup
  const allLocalVariables = await getVariablesWithoutZombies();
  console.log('[REF UPDATE] Got', allLocalVariables.length, 'local variables');

  // Process references in batches to avoid overwhelming Figma's API and provide progress updates
  console.log('[REF UPDATE] Starting processBatches with', referenceVariableCandidates.length, 'candidates...');
  let lastReported = 0;
  await processBatches(
    referenceVariableCandidates,
    100, // Process 100 references at a time
    async (aliasVariable) => {
      // First, try to find the reference variable in the same collection as the aliasing variable
      const sameCollectionVariable = allLocalVariables.find((v) => {
        const normalizedName = v.name.split('/').join('.');
        return normalizedName === aliasVariable.referenceVariable
               && v.variableCollectionId === aliasVariable.variable.variableCollectionId;
      });

      let referenceVariableKey: string | undefined;

      if (sameCollectionVariable) {
        // Prioritize variable from the same collection
        referenceVariableKey = sameCollectionVariable.key;
      } else {
        // Fall back to the global map lookup if no same-collection variable found
        referenceVariableKey = figmaVariables.get(aliasVariable.referenceVariable);
      }

      if (!referenceVariableKey) return;

      let variable;
      try {
        variable = await figma.variables.importVariableByKeyAsync(referenceVariableKey);
      } catch (e) {
        console.log('error importing variable', e);
      }
      if (!variable) return;
      try {
        await aliasVariable.variable.setValueForMode(aliasVariable.modeId, {
          type: 'VARIABLE_ALIAS',
          id: variable.id,
        });
        updatedVariables.push(aliasVariable.variable);
      } catch (e) {
        console.log('error setting value for mode', e, aliasVariable, variable);
      }
    },
    (completed, total) => {
      // Report progress if there are enough references to track
      console.log('[REF UPDATE] Progress:', completed, '/', total);
      if (referenceVariableCandidates.length > 10) {
        const delta = completed - lastReported;
        console.log('[REF UPDATE] Sending delta:', delta);
        postToUI({
          type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
          name: BackgroundJobs.UI_LINK_VARIABLE_REFERENCES,
          count: delta, // Send the delta, not the total
          timePerTask: 15,
        });
        lastReported = completed;
        // Force UI update by yielding control briefly
        return new Promise((resolve) => setTimeout(resolve, 0));
      }
    },
  );
  console.log('[REF UPDATE] Finished processBatches, returning', updatedVariables.length, 'updated variables');
  return updatedVariables;
}
