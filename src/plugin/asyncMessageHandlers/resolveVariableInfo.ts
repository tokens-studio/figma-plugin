import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getVariablesMap } from '@/utils/getVariablesMap';

export type ResolvedVariableInfo = {
  name: string;
  key: string
};
export const resolveVariableInfo: AsyncMessageChannelHandlers[AsyncMessageTypes.RESOLVE_VARIABLE_INFO] = async (msg) => {
  const localVariableMap = getVariablesMap();
  const resolvedValues = msg.variableIds.reduce<Record<string, ResolvedVariableInfo>>((acc, curr) => {
    if (localVariableMap[curr]) {
      acc[curr] = {
        name: localVariableMap[curr].name,
        key: localVariableMap[curr].key,
      };
    }
    return acc;
  }, {});
  return {
    resolvedValues,
  };
};
