import { ReferenceVariableType } from './setValuesOnVariable';

export default async function updateVariablesToReference(figmaVariables: Map<string, string>, referenceVariableCandidates: ReferenceVariableType[]): Promise<Variable[]> {
  const updatedVariables: Variable[] = [];
  console.log('variable candidates', referenceVariableCandidates);

  await Promise.all(referenceVariableCandidates.map(async (aliasVariable) => {
    const referenceVariable = figmaVariables.get(aliasVariable.referenceVariable);
    console.log('referenceVariable', referenceVariable, aliasVariable.referenceVariable);

    if (!referenceVariable) return;
    let variable;
    try {
      variable = await figma.variables.importVariableByKeyAsync(referenceVariable);
    } catch (e) {
      console.error('error importing variable', e);
    }
    if (!variable) return;
    await aliasVariable.variable.setValueForMode(aliasVariable.modeId, {
      type: 'VARIABLE_ALIAS',
      id: variable.id,
    });
    updatedVariables.push(aliasVariable.variable);
  }));
  return updatedVariables;
}
