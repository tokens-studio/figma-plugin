import { ReferenceVariableType } from './setValuesOnVariable';

export default async function updateVariablesToReference(
  figmaVariables: Map<string, string>,
  referenceVariableCandidates: ReferenceVariableType[],
): Promise<Variable[]> {
  const updatedVariables: Variable[] = [];
  await Promise.all(
    referenceVariableCandidates.map(async (aliasVariable) => {
      const referenceVariable = figmaVariables.get(aliasVariable.referenceVariable);
      if (!referenceVariable) return;
      let variable;
      try {
        variable = await figma.variables.importVariableByKeyAsync(referenceVariable);
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
