import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';
import setColorValuesOnVariable from './setColorValuesOnVariable';
import { TokenTypes } from '@/constants/TokenTypes';
import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import setStringValuesOnVariable from './setStringValuesOnVariable';
import { UpdateTokenVariablePayload } from '@/types/payloads/UpdateTokenVariablePayload';
import { checkCanReferenceVariable } from '@/utils/alias/checkCanReferenceVariable';

export default async function updateVariablesFromPlugin(payload: UpdateTokenVariablePayload) {
  console.log('payload in updateVariableFromPlugin: ', payload);
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  console.log('themeInfo: ', themeInfo);
  const variableMap = getVariablesMap();
  const nameToVariableMap = figma.variables.getLocalVariables().reduce<Record<string, Variable>>((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});
  console.log('nameToVariableMap: ', nameToVariableMap);

  themeInfo.themes.forEach((theme) => {
    if (Object.entries(theme.selectedTokenSets).some(([tokenSet, status]) => status === TokenSetStatus.ENABLED && tokenSet === payload.parent)) { // Filter themes which contains this token
      console.log('theme in updateVariablesFromPlugin: ', theme);
      if (theme.$figmaVariableReferences?.[payload.name] && theme.$figmaModeId) {
        const variable = variableMap[theme?.$figmaVariableReferences?.[payload.name]];
        console.log('variable in updateVariablesFromPlugin: ', variable);
        if (checkCanReferenceVariable(payload)) { // If new token reference to another token, we update the variable to reference to another variable
          let referenceTokenName: string = '';
          if (payload.rawValue && payload.rawValue?.toString().startsWith('{')) {
            referenceTokenName = payload.rawValue?.toString().slice(1, payload.rawValue.toString().length - 1);
          } else {
            referenceTokenName = payload.rawValue!.toString().substring(1);
          }
          const referenceVariable = nameToVariableMap[referenceTokenName.split('.').join('/')];
          if (referenceVariable) {
            variable.setValueForMode(theme.$figmaModeId, {
              type: 'VARIABLE_ALIAS',
              id: referenceVariable.id,
            });
          }
        } else {
          switch (payload.type) {
            case TokenTypes.COLOR:
              if (typeof payload.value === 'string') {
                console.log('222222222222222222222222222222');
                setColorValuesOnVariable(variable, theme.$figmaModeId, payload.value);
              }
              break;
            case TokenTypes.BOOLEAN:
              if (typeof payload.value === 'string') {
                setBooleanValuesOnVariable(variable, theme.$figmaModeId, payload.value);
              }
              break;
            case TokenTypes.TEXT:
              if (typeof payload.value === 'string') {
                setStringValuesOnVariable(variable, theme.$figmaModeId, payload.value);
              }
              break;
            case TokenTypes.SIZING:
            case TokenTypes.DIMENSION:
            case TokenTypes.BORDER_RADIUS:
            case TokenTypes.BORDER_WIDTH:
            case TokenTypes.SPACING:
            case TokenTypes.NUMBER:
              setNumberValuesOnVariable(variable, theme.$figmaModeId, Number(payload.value));
              break;
            default: break;
          }
        }
      }
    }
  });
}
