import { SingleToken } from '@/types/tokens';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import setStringValuesOnVariable from './setStringValuesOnVariable';
import { convertTokenTypeToVariableType } from '@/utils/convertTokenTypeToVariableType';
import { checkCanReferenceVariable } from '@/utils/alias/checkCanReferenceVariable';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { SettingsState } from '@/app/store/models/settings';

export type ReferenceVariableType = {
  variable: Variable;
  modeId: string;
  referenceVariable: string;
};

export default function setValuesOnVariable(
  variablesInFigma: Variable[],
  tokens: SingleToken<true, { path: string, variableId: string }>[],
  collection: VariableCollection,
  mode: string,
  settings: SettingsState,
) {
  const variableKeyMap: Record<string, string> = {};
  const referenceVariableCandidates: ReferenceVariableType[] = [];
  try {
    tokens.forEach((t) => {
      const variableType = convertTokenTypeToVariableType(t.type);
      // Find the connected variable
      const slice = settings?.ignoreFirstPartForStyles ? 1 : 0;
      const tokenPath = convertTokenNameToPath(t.name, null, slice);
      let variable = variablesInFigma.find((v) => (v.key === t.variableId && !v.remote) || v.name === tokenPath);
      if (!variable) {
        variable = figma.variables.createVariable(tokenPath, collection.id, variableType);
      }
      if (variable) {
        variable.description = t.description ?? '';
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
        variableKeyMap[t.name] = variable.key;

        const referenceVariable = convertTokenNameToPath(referenceTokenName, null, slice);

        if (checkCanReferenceVariable(t)) {
          referenceVariableCandidates.push({
            variable,
            modeId: mode,
            referenceVariable,
          });
        }
      }
    });
  } catch (e) {
    console.error('Setting values on variable is failed', e);
  }

  return {
    variableKeyMap,
    referenceVariableCandidates,
  };
}
