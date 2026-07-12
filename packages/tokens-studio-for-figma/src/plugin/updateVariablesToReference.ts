import { ReferenceVariableType } from './setValuesOnVariable';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { processBatches } from '@/utils/processBatches';
import { resolveCollectionContext } from './extendedCollections/collectionContext';
import { applyChildModeValue } from './extendedCollections/applyChildModeValue';

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

  // Phase split: regular/parent-collection candidates must be FULLY processed
  // before extended-collection candidates. Extended candidates compare the child
  // mode against the parent mode's alias to decide inherit-vs-override — that
  // comparison is only valid once the parent's alias write has landed. Candidates
  // are batched concurrently, so ordering within one list is not enough; the two
  // groups run as separate sequential passes.
  const regularCandidates = referenceVariableCandidates.filter((c) => !c.collection);
  const extendedCandidates = referenceVariableCandidates.filter((c) => c.collection);
  // eslint-disable-next-line no-console
  console.log(`[updateVariablesToReference] total=${referenceVariableCandidates.length} regular=${regularCandidates.length} extended=${extendedCandidates.length}`);

  // Process references in batches to avoid overwhelming Figma's API and provide progress updates
  let lastReported = 0;
  let progressOffset = 0;
  const processCandidate = async (aliasVariable: ReferenceVariableType) => {
    // Normalize reference name to dot notation for consistent lookup
    const normalizedRefName = aliasVariable.referenceVariable.split('/').join('.');

    // O(1) lookup instead of O(n) find
    const candidateVariables = normalizedVariableMap.get(normalizedRefName) || [];

    // Find variable in the same collection first, but exclude self-references
    // (for extended collections, source and target share the same parent collection ID)
    const sameCollectionVariable = candidateVariables.find(
      (v) => v.variableCollectionId === aliasVariable.variable.variableCollectionId
          && v !== aliasVariable.variable,
    );

    let referenceVariableKey: string | undefined;

    // Check if it's in the same collection
    if (sameCollectionVariable) {
      // Prioritize variable from the same collection
      referenceVariableKey = sameCollectionVariable.key;
    } else {
      // Fall back to the global map lookup if no same-collection variable found
      // Try both dot and slash notation to handle mixed formats
      referenceVariableKey = figmaVariables.get(normalizedRefName)
          ?? figmaVariables.get(aliasVariable.referenceVariable);
    }

    if (!referenceVariableKey) {
      return;
    }

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

    if (!variable) {
      return;
    }

    // Use the mode ID exactly as Figma reports it. For extended collections this is the
    // composite form ("VariableCollectionId:25:6/25:4"), which is the key the extended
    // collection's own variables use in valuesByMode and accept in setValueForMode.
    // Regular collections use plain mode IDs ("25:4"). Stripping the composite form breaks
    // extended collections, so we pass the raw mode ID through unchanged.
    const effectiveModeId = aliasVariable.modeId;

    try {
      const newValue: VariableAlias = {
        type: 'VARIABLE_ALIAS',
        id: variable.id,
      };

      // Extended collections: one shared inherit-vs-override decision. Runs
      // before any existing-value early-return so stale explicit overrides
      // from previous exports self-heal back to inherited.
      const { parentModeId } = resolveCollectionContext(aliasVariable.collection, effectiveModeId);
      if (parentModeId) {
        const parentVal = aliasVariable.variable.valuesByMode[parentModeId];
        const result = applyChildModeValue(aliasVariable.variable, effectiveModeId, parentModeId, newValue);
        // eslint-disable-next-line no-console
        console.log(`[updateVariablesToReference] EXTENDED: "${aliasVariable.variable.name}" mode=${effectiveModeId} parentMode=${parentModeId} → result=${result} (desired alias id=${variable.id}, parentVal=${JSON.stringify(parentVal)})`);
        if (result !== 'unchanged') {
          updatedVariables.push(aliasVariable.variable);
        }
        return;
      }

      const existingValue = aliasVariable.variable.valuesByMode?.[effectiveModeId];
      if (
        typeof existingValue === 'object'
          && existingValue !== null
          && (existingValue as any).type === 'VARIABLE_ALIAS'
          && (existingValue as any).id === variable.id
      ) {
        return;
      }

      await aliasVariable.variable.setValueForMode(effectiveModeId, newValue);
      updatedVariables.push(aliasVariable.variable);
    } catch (e) {
      console.log('error setting value for mode', e, aliasVariable, variable);
    }
  };

  const reportProgress = (completed: number, _total: number) => {
    // Report progress if there are enough references to track
    if (referenceVariableCandidates.length > 10) {
      const overallCompleted = progressOffset + completed;
      const delta = overallCompleted - lastReported;
      postToUI({
        type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
        name: BackgroundJobs.UI_LINK_VARIABLE_REFERENCES,
        count: delta, // Send the delta, not the total
        timePerTask: 15,
      });
      lastReported = overallCompleted;
    }
  };

  // Pass 1: regular/parent collections — parent aliases land first
  await processBatches(regularCandidates, 100, processCandidate, reportProgress);
  progressOffset = regularCandidates.length;
  // Pass 2: extended collections — child modes now compare against final parent values
  await processBatches(extendedCandidates, 100, processCandidate, reportProgress);

  return updatedVariables;
}
