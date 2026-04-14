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
  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });
  const variableMap = await getVariablesMap();
  const nameToVariableMap = (await figma.variables.getLocalVariablesAsync())?.reduce<Record<string, Variable>>((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});

  themeInfo.themes.forEach((theme) => {
    if (
      Object.entries(theme.selectedTokenSets).some(
        ([tokenSet, status]) => status === TokenSetStatus.ENABLED && tokenSet === payload.parent,
      )
    ) {
      // Filter themes which contains this token
      if (theme.$figmaVariableReferences?.[payload.name] && theme.$figmaModeId && theme.$figmaCollectionId) {
        const variable = variableMap[theme?.$figmaVariableReferences?.[payload.name]];
        if (Object.values(themeInfo.activeTheme).includes(theme.id)) {
          figma.variables.getVariableCollectionByIdAsync(theme.$figmaCollectionId).then((collection) => {
            if (!collection) return;

            if (checkCanReferenceVariable(payload)) {
              // If new token reference to another token, we update the variable to reference to another variable
              let referenceTokenName: string = '';
              if (payload.rawValue && payload.rawValue?.toString().startsWith('{')) {
                referenceTokenName = payload.rawValue?.toString().slice(1, payload.rawValue.toString().length - 1);
              } else {
                referenceTokenName = payload.rawValue!.toString().substring(1);
              }
              const referenceVariable = nameToVariableMap[referenceTokenName.split('.').join('/')];
              if (referenceVariable) {
                const newValue: any = {
                  type: 'VARIABLE_ALIAS',
                  id: referenceVariable.id,
                };

                // Handle extended collections: if alias matches parent mode, clear override
                const modeObj = collection.modes.find((m) => m.modeId === theme.$figmaModeId);
                const parentModeId = (modeObj as any)?.parentModeId;

                if (parentModeId) {
                  const parentValue = variable.valuesByMode[parentModeId];
                  if (
                    typeof parentValue === 'object'
                    && parentValue !== null
                    && (parentValue as any).type === 'VARIABLE_ALIAS'
                    && (parentValue as any).id === referenceVariable.id
                  ) {
                    (variable as any).clearValueForMode(theme.$figmaModeId!);
                    return;
                  }
                }

                variable.setValueForMode(theme.$figmaModeId!, newValue);
              }
            } else {
              switch (payload.type) {
                case TokenTypes.COLOR:
                  if (typeof payload.value === 'string') {
                    setColorValuesOnVariable(variable, theme.$figmaModeId!, payload.value, collection);
                  }
                  break;
                case TokenTypes.BOOLEAN:
                  if (typeof payload.value === 'string') {
                    setBooleanValuesOnVariable(variable, theme.$figmaModeId!, payload.value, collection);
                  }
                  break;
                case TokenTypes.TEXT:
                  if (typeof payload.value === 'string') {
                    setStringValuesOnVariable(variable, theme.$figmaModeId!, payload.value, collection);
                  }
                  break;
                case TokenTypes.SIZING:
                case TokenTypes.DIMENSION:
                case TokenTypes.BORDER_RADIUS:
                case TokenTypes.BORDER_WIDTH:
                case TokenTypes.SPACING:
                case TokenTypes.NUMBER:
                  setNumberValuesOnVariable(variable, theme.$figmaModeId!, Number(payload.value), collection);
                  break;
                default:
                  break;
              }
            }
          });
        }
      }
    }
  });
}
