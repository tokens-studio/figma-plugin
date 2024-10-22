import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';

export type ResolvedVariableInfo = {
  name: string;
  key: string
};
export const resolveVariableInfo: AsyncMessageChannelHandlers[AsyncMessageTypes.RESOLVE_VARIABLE_INFO] = async (msg) => {
  const localVariableMap = await getVariablesMap();
  const resolvedValues: Record<string, ResolvedVariableInfo> = {};
  await Promise.all(msg.variableIds.map(async (variableId) => {
    if (localVariableMap[variableId]) {
      resolvedValues[variableId] = {
        name: localVariableMap[variableId].name,
        key: localVariableMap[variableId].key,
      };
    } else {
      const variable = await figma.variables.importVariableByKeyAsync(variableId);
      if (variable) {
        resolvedValues[variableId] = {
          name: variable.name,
          key: variable.key,
        };
      }
    }
  }));
  return {
    resolvedValues,
  };
};
