import { SingleToken } from '@/types/tokens';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import setStringValuesOnVariable from './setStringValuesOnVariable';
import { convertTokenTypeToVariableType } from '@/utils/convertTokenTypeToVariableType';
import { checkCanReferenceVariable } from '@/utils/alias/checkCanReferenceVariable';

export type ReferenceVariableType = {
  variable: Variable;
  modeId: string;
  referenceVariable: string;
};

export default async function setValuesOnVariable(
  variablesInFigma: Variable[],
  tokens: SingleToken<true, { path: string, variableId: string }>[],
  collection: VariableCollection,
  mode: string,
) {
  const variableKeyMap: Record<string, string> = {};
  const referenceVariableCandidates: ReferenceVariableType[] = [];
  try {
    await Promise.all(tokens.map(async (token) => {
      const variableType = convertTokenTypeToVariableType(token.type);
      // Find the connected variable
      let variable = variablesInFigma.find((v) => (v.key === token.variableId && !v.remote) || v.name === token.path);
      if (!variable) {
        variable = figma.variables.createVariable(token.path, collection.id, variableType);
      }
      if (variable) {
        variable.description = token.description ?? '';
        switch (variableType) {
          case 'BOOLEAN':
            if (typeof token.value === 'string') {
              setBooleanValuesOnVariable(variable, mode, token.value);
            }
            break;
          case 'COLOR':
            if (typeof token.value === 'string') {
              setColorValuesOnVariable(variable, mode, token.value);
            }
            break;
          case 'FLOAT':
            setNumberValuesOnVariable(variable, mode, Number(token.value));
            break;
          case 'STRING':
            if (typeof token.value === 'string') {
              setStringValuesOnVariable(variable, mode, token.value);
            }
            break;
          default:
            break;
        }
        let referenceTokenName: string = '';
        if (token.rawValue && token.rawValue?.toString().startsWith('{')) {
          referenceTokenName = token.rawValue?.toString().slice(1, token.rawValue.toString().length - 1);
        } else {
          referenceTokenName = token.rawValue!.toString().substring(1);
        }
        variableKeyMap[token.name] = variable.key;
        if (token && checkCanReferenceVariable(token)) {
          referenceVariableCandidates.push({
            variable,
            modeId: mode,
            referenceVariable: referenceTokenName,
          });
        }
      }
    }));
  } catch (e) {
    console.error('Setting values on variable failed', e);
  }

  return {
    variableKeyMap,
    referenceVariableCandidates,
  };
}
