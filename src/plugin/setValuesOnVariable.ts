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
): Record<string, ReferenceVariableType> {
  const variableObj: Record<string, ReferenceVariableType> = {};
  try {
    tokens.forEach((t) => {
    // Find the connected variable
      let variable = variablesInFigma.find((v) => (v.key === t.variableId && !v.remote) || v.name === t.path);
      if (!variable) {
        variable = figma.variables.createVariable(t.path, collection.id, variableType);
      }
      if (variable) {
        switch (variableType) {
          case 'BOOLEAN':
            if (typeof t.value === 'string') {
              setBooleanValuesOnVariable(variable, mode, t.value);
            }
            break;
          case 'COLOR':
            if (typeof t.value === 'string') {
              setColorValuesOnVariable(variable, mode, t.value);
            }
            break;
          case 'FLOAT':
            setNumberValuesOnVariable(variable, mode, Number(t.value));
            break;
          case 'STRING':
            if (typeof t.value === 'string') {
              setStringValuesOnVariable(variable, mode, t.value);
            }
            break;
          default:
            break;
        }
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
          shouldReferenceToVariable: checkIfContainsAlias(t.rawValue) && !t.$extensions?.['studio.tokens']?.modify,
        };
      }
    });
  } catch (e) {
    console.error('Setting values on variable is failed', e);
  }
  return variableObj;
}
