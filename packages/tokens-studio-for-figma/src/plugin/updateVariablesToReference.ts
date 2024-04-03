import { ReferenceVariableType } from './setValuesOnVariable';

export default async function updateVariablesToReference(figmaVariables: Variable[], referenceVariableCandidates: ReferenceVariableType[]): Promise<Variable[]> {
  const nameToVariableMap = figmaVariables.reduce<Record<string, Variable>>((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});
  const updatedVariables: Variable[] = [];
  console.log('setting variable reference', referenceVariableCandidates, figmaVariables);
  await Promise.all(referenceVariableCandidates.map(async (aliasVariable) => {
    console.log('setting variable locaaal', nameToVariableMap, aliasVariable);
    const referenceVariable = nameToVariableMap[aliasVariable.referenceVariable];
    if (referenceVariable) {
      await aliasVariable.variable.setValueForMode(aliasVariable.modeId, {
        type: 'VARIABLE_ALIAS',
        id: referenceVariable.id,

      });
      updatedVariables.push(aliasVariable.variable);
    }
  }));
  return updatedVariables;
}
