import { SingleToken } from '@/types/tokens';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';

export default function setValuesOnVariable(
  variablesInFigma: Variable[],
  tokens: SingleToken<true, { path: string, variableId: string }>[],
  variableType: VariableResolvedDataType,
  collection: VariableCollection,
  mode: string,
): Record<string, string> {
  const variableIds: Record<string, string> = {};
  tokens.forEach((t) => {
    let variable = variablesInFigma.find((v) => ((v.id === t.variableId && !v.remote) || (v.name === t.path && v.variableCollectionId === collection.id)));
    if (variable) {
      variable.name = t.path;
    } else {
      variable = figma.variables.createVariable(t.path, collection.id, variableType);
    }
    if (variableType === 'BOOLEAN' && typeof t.value === 'string') {
      setBooleanValuesOnVariable(variable, mode, t.value);
    }
    if (variableType === 'COLOR' && typeof t.value === 'string') {
      setColorValuesOnVariable(variable, mode, t.value);
    }
    if (variableType === 'FLOAT') {
      setNumberValuesOnVariable(variable, mode, Number(t.value));
    }
    variableIds[t.name] = variable.id;
  });

  return variableIds;
}
