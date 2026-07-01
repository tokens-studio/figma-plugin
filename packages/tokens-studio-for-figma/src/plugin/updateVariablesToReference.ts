import { ReferenceVariableType } from './setValuesOnVariable';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { processBatches } from '@/utils/processBatches';

export default async function updateVariablesToReference(figmaVariables: Map<string, string>, referenceVariableCandidates: ReferenceVariableType[]): Promise<Variable[]> {
  const updatedVariables: Variable[] = [];

  // DIAGNOSTIC: collect candidates that wanted to reference a variable but ended up resolved-only
  // (the alias could not be linked). Reported as a consolidated summary at the end.
  const resolvedOnlyFailures: Array<{
    variableName: string;
    referenceVariable: string;
    collectionName?: string;
    reason: string;
  }> = [];

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
        console.log(
          `[updateVariablesToReference] ❌ No referenceVariableKey found for variable "${aliasVariable.variable.name}" → ref "${aliasVariable.referenceVariable}"`,
          `\n  normalizedRefName: "${normalizedRefName}"`,
          `\n  candidateVariables (from normalizedVariableMap): ${candidateVariables.length}`,
          `\n  sameCollectionVariable: ${sameCollectionVariable?.name ?? 'none'}`,
          `\n  figmaVariables has key (dot): ${figmaVariables.has(normalizedRefName)}`,
          `\n  figmaVariables has key (raw): ${figmaVariables.has(aliasVariable.referenceVariable)}`,
        );
        resolvedOnlyFailures.push({
          variableName: aliasVariable.variable.name,
          referenceVariable: aliasVariable.referenceVariable,
          collectionName: aliasVariable.collection?.name,
          reason: 'referenced token has no matching variable (not created in any accessible collection)',
        });
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
        console.log(
          `[updateVariablesToReference] ❌ Variable import failed for "${aliasVariable.variable.name}" → ref "${aliasVariable.referenceVariable}"`,
          `\n  referenceVariableKey: "${referenceVariableKey}"`,
          `\n  candidateVariables: ${candidateVariables.map((v) => v.name).join(', ')}`,
        );
        resolvedOnlyFailures.push({
          variableName: aliasVariable.variable.name,
          referenceVariable: aliasVariable.referenceVariable,
          collectionName: aliasVariable.collection?.name,
          reason: 'reference variable key found but importVariableByKeyAsync failed (remote/library variable not importable)',
        });
        return;
      }

      // Use the mode ID exactly as Figma reports it. For extended collections this is the
      // composite form ("VariableCollectionId:25:6/25:4"), which is the key the extended
      // collection's own variables use in valuesByMode and accept in setValueForMode.
      // Regular collections use plain mode IDs ("25:4"). Stripping the composite form breaks
      // extended collections, so we pass the raw mode ID through unchanged.
      const effectiveModeId = aliasVariable.modeId;

      console.log(
        `[updateVariablesToReference] ✅ Setting alias "${aliasVariable.variable.name}" → "${variable.name}" (mode: ${effectiveModeId})`,
      );

      try {
        const newValue: any = {
          type: 'VARIABLE_ALIAS',
          id: variable.id,
        };

        const existingValue = aliasVariable.variable.valuesByMode?.[effectiveModeId];
        if (
          typeof existingValue === 'object'
          && existingValue !== null
          && (existingValue as any).type === 'VARIABLE_ALIAS'
          && (existingValue as any).id === variable.id
        ) {
          return;
        }

        // For extended collections: if the parent mode already has the same alias,
        // clear the child override so Figma inherits from parent (not shown as blue/overridden)
        const extendedMode = aliasVariable.collection?.modes?.find((m: any) => m.modeId === effectiveModeId);
        const parentModeId = (extendedMode as any)?.parentModeId;
        if (parentModeId) {
          const parentValue = aliasVariable.variable.valuesByMode?.[parentModeId];
          if (
            typeof parentValue === 'object'
            && parentValue !== null
            && (parentValue as any).type === 'VARIABLE_ALIAS'
            && (parentValue as any).id === variable.id
          ) {
            (aliasVariable.variable as any).clearValueForMode(effectiveModeId);
            updatedVariables.push(aliasVariable.variable);
            return;
          }
        }

        await aliasVariable.variable.setValueForMode(effectiveModeId, newValue);
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

  // DIAGNOSTIC SUMMARY: report every variable that stayed resolved-only at the linking stage,
  // grouped by collection, plus actionable suggestions for improving the (extended) theme config.
  if (resolvedOnlyFailures.length > 0) {
    const byCollection = new Map<string, typeof resolvedOnlyFailures>();
    resolvedOnlyFailures.forEach((f) => {
      const key = f.collectionName ?? '(unknown collection)';
      const list = byCollection.get(key) || [];
      list.push(f);
      byCollection.set(key, list);
    });

    console.log(`\n========== RESOLVED-ONLY VARIABLES (${resolvedOnlyFailures.length}) ==========`);
    console.log('These variables wanted to reference another variable but were written as raw values instead.\n');
    byCollection.forEach((failures, collectionName) => {
      console.log(`Collection "${collectionName}" — ${failures.length} unreferenced:`);
      failures.forEach((f) => {
        console.log(`  • "${f.variableName}" → wanted ref "{${f.referenceVariable}}"  (${f.reason})`);
      });
    });

    console.log('\n---------- How to improve your extended theme config ----------');
    console.log([
      '1. Make sure every referenced token resolves to a token that ALSO becomes a variable.',
      '   A reference like "{color.brand.500}" only links if "color.brand.500" exists AND its',
      '   token set is enabled (source or enabled) in this theme. If the target set is "disabled"',
      '   the value resolves but no variable is created to alias to.',
      '',
      '2. For extended collections specifically: the referenced variable must live in the SAME',
      '   collection or its PARENT collection. Cross-collection references (to a collection that',
      "   isn't the parent) cannot be aliased and will fall back to resolved values.",
      '',
      '3. Process order matters — parent themes must be exported before extended themes so the',
      '   parent variables exist to reference. Confirm the parent theme is included in the export.',
      '',
      '4. Avoid math/modifiers on tokens you want linked. A "studio.tokens.modify" extension',
      "   (e.g. lighten/darken/multiply) cannot map to a Figma alias — Figma can't store a computed",
      '   reference, so the value is baked in. Move the math upstream into a referenced base token.',
      '',
      '5. Avoid composite values for linked tokens. "{spacing.sm} {spacing.lg}" has 2 references;',
      '   a Figma variable can alias exactly one variable. Split into single-reference tokens.',
      '',
      '6. If the target is a remote/library variable, ensure the library is enabled in the file so',
      '   importVariableByKeyAsync can resolve it.',
    ].join('\n'));
    console.log('===============================================================\n');
  }

  return updatedVariables;
}
