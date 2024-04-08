import { ReferenceVariableType } from './setValuesOnVariable';

export default async function updateVariablesToReference(figmaVariables: Map<string, string>, referenceVariableCandidates: ReferenceVariableType[]): Promise<Variable[]> {
  const updatedVariables: Variable[] = [];
  await Promise.all(referenceVariableCandidates.map(async (aliasVariable) => {
    const referenceVariable = figmaVariables.get(aliasVariable.referenceVariable);
    if (!referenceVariable) return;
    const variable = await figma.variables.importVariableByKeyAsync(referenceVariable);
    if (!variable) return;
    await aliasVariable.variable.setValueForMode(aliasVariable.modeId, {
      type: 'VARIABLE_ALIAS',
      id: variable.id,
    });
    updatedVariables.push(aliasVariable.variable);
  }));
  return updatedVariables;
}
