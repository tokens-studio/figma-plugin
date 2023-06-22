import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';

export type ResolvedVariableInfo = {
  name: string;
  key: string
};
export const resolveVariableInfo: AsyncMessageChannelHandlers[AsyncMessageTypes.RESOLVE_VARIABLE_INFO] = async (msg) => {
  const localVariableMap = getVariablesMap();
  const resolvedValues: Record<string, ResolvedVariableInfo> = {};

  msg.variableIds.forEach(async (id) => {
    try {
      const remoteVariable = await figma.variables.importVariableByKeyAsync(id);
      if (remoteVariable) {
        resolvedValues[id] = {
          key: remoteVariable.key,
          name: remoteVariable.name,
        };
      } else if (localVariableMap[id]) {
        resolvedValues[id] = {
          key: localVariableMap[id].key,
          name: localVariableMap[id].name,
        };
      }
    } catch (err) {
      console.error(err);
    }
  });

  return {
    resolvedValues,
  };
};
