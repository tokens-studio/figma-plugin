import { ReferenceVariableType } from './setValuesOnVariable';

export default async function updateVariablesToReference(figmaVariables: Variable[], referenceVariableCandidates: ReferenceVariableType[]) {
  const nameToVariableMap = figmaVariables.reduce<Record<string, Variable>>((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});
  referenceVariableCandidates.forEach((aliasVariable) => {
    const referenceVariable = nameToVariableMap[aliasVariable.referenceVariable];
    if (referenceVariable) {
      aliasVariable.variable.setValueForMode(aliasVariable.modeId, {
        type: 'VARIABLE_ALIAS',
        id: referenceVariable.id,
      });
    }
  });
}
