import { ReferenceVariableType } from './setValuesOnVariable';
import { getVariablesWithoutZombies } from './getVariablesWithoutZombies';

export default async function updateVariablesToReference(
  figmaVariables: Map<string, string>,
  referenceVariableCandidates: ReferenceVariableType[],
): Promise<Variable[]> {
  const updatedVariables: Variable[] = [];

  // Get all local variables to enable collection-aware lookup
  const allLocalVariables = await getVariablesWithoutZombies();

  await Promise.all(
    referenceVariableCandidates.map(async (aliasVariable) => {
      // First, try to find the reference variable in the same collection as the aliasing variable
      const sameCollectionVariable = allLocalVariables.find((v) => {
        const normalizedName = v.name.split('/').join('.');
        return (
          normalizedName === aliasVariable.referenceVariable &&
          v.variableCollectionId === aliasVariable.variable.variableCollectionId
        );
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
    }),
  );
  return updatedVariables;
}
