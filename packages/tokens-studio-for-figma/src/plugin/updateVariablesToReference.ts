import { ReferenceVariableType } from './setValuesOnVariable';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { processBatches } from '@/utils/processBatches';

export default async function updateVariablesToReference(figmaVariables: Map<string, string>, referenceVariableCandidates: ReferenceVariableType[]): Promise<Variable[]> {
  const updatedVariables: Variable[] = [];

  // Get all local variables to enable collection-aware lookup
  const allLocalVariables = await getVariablesWithoutZombies();

  // Pre-compute normalized name lookup for O(1) access instead of O(n) linear search
  // Store arrays of variables per normalized name to handle multiple variables with same name in different collections
  const normalizedVariableMap = new Map<string, Variable[]>();
  allLocalVariables.forEach((v) => {
    const normalizedName = v.name.split('/').join('.');
    const existing = normalizedVariableMap.get(normalizedName) || [];
    existing.push(v);
    normalizedVariableMap.set(normalizedName, existing);
  });

  // Cache for importVariableByKeyAsync to avoid redundant API calls
  const importedVariableCache = new Map<string, Variable>();

  // Process references in batches to avoid overwhelming Figma's API and provide progress updates
  let lastReported = 0;
  await processBatches(
    referenceVariableCandidates,
    100, // Process 100 references at a time
    async (aliasVariable) => {
      // O(1) lookup instead of O(n) find
      const candidateVariables = normalizedVariableMap.get(aliasVariable.referenceVariable) || [];

      // Find variable in the same collection first
      const sameCollectionVariable = candidateVariables.find(
        (v) => v.variableCollectionId === aliasVariable.variable.variableCollectionId,
      );

      let referenceVariableKey: string | undefined;

      // Check if it's in the same collection
      if (sameCollectionVariable) {
        // Prioritize variable from the same collection
        referenceVariableKey = sameCollectionVariable.key;
      } else {
        // Fall back to the global map lookup if no same-collection variable found
        referenceVariableKey = figmaVariables.get(aliasVariable.referenceVariable);
      }

      if (!referenceVariableKey) return;

      // Check cache first before calling importVariableByKeyAsync
      let variable = importedVariableCache.get(referenceVariableKey);
      if (!variable) {
        try {
          variable = await figma.variables.importVariableByKeyAsync(referenceVariableKey);
          if (variable) {
            importedVariableCache.set(referenceVariableKey, variable);
          }
        } catch (e) {
          console.log('error importing variable', e);

          // Fallback: If import fails, try to find by name in candidate variables
          // This handles cases where remote library variables are already imported but
          // can't be re-imported via key (e.g., library not enabled, permissions issues)
          if (candidateVariables.length > 0) {
            // Try to use the first available variable with this name as a fallback
            [variable] = candidateVariables;
            console.log(`Using fallback variable by name: ${variable.name} (id: ${variable.id})`);
          }
        }
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
    (completed, _total) => {
      // Report progress if there are enough references to track
      if (referenceVariableCandidates.length > 10) {
        const delta = completed - lastReported;
        postToUI({
          type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
          name: BackgroundJobs.UI_LINK_VARIABLE_REFERENCES,
          count: delta, // Send the delta, not the total
          timePerTask: 15,
        });
        lastReported = completed;
      }
    },
  );
  return updatedVariables;
}
