import { SingleToken } from '@/types/tokens';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import { checkIfContainsAlias } from '@/utils/alias';
import setStringValuesOnVariable from './setStringValuesOnVariable';

export type ReferenceVariableType = {
  variable: Variable;
  modeId: string;
  referenceVariable: string;
  shouldReferenceToVariable: boolean;
};

export default function setValuesOnVariable(
  variablesInFigma: Variable[],
  tokens: SingleToken<true, { path: string, variableId: string }>[],
  variableType: VariableResolvedDataType,
  collection: VariableCollection,
  mode: string,
  shouldCreate: boolean,
): Record<string, ReferenceVariableType> {
  const variableObj: Record<string, ReferenceVariableType> = {};
  tokens.forEach((t) => {
    // Find the connected variable
    let variable = variablesInFigma.find((v) => (v.id === t.variableId && !v.remote) || v.name === t.path);
    if (!variable && shouldCreate) {
      variable = figma.variables.createVariable(t.path, collection.id, variableType);
    }
    if (variable && variableType === 'BOOLEAN' && typeof t.value === 'string') {
      setBooleanValuesOnVariable(variable, mode, t.value);
    }
    if (variable && variableType === 'COLOR' && typeof t.value === 'string') {
      setColorValuesOnVariable(variable, mode, t.value);
    }
    if (variable && variableType === 'FLOAT') {
      setNumberValuesOnVariable(variable, mode, Number(t.value));
    }
    if (variable && variableType === 'STRING' && typeof t.value === 'string') {
      setStringValuesOnVariable(variable, mode, t.value);
    }
    if (variable) {
      let referenceTokenName: string = '';
      if (t.rawValue && t.rawValue?.toString().startsWith('{')) {
        referenceTokenName = t.rawValue?.toString().slice(1, t.rawValue.toString().length - 1);
      } else {
        referenceTokenName = t.rawValue!.toString().substring(1);
      }
      variableObj[t.name] = {
        variable,
        modeId: mode,
        referenceVariable: referenceTokenName.split('.').join('/'),
        shouldReferenceToVariable: checkIfContainsAlias(t.rawValue),
      };
    }
  });

  return variableObj;
}
