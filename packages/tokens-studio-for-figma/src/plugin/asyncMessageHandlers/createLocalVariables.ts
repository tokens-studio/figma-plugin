import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import createLocalVariablesInPlugin from '../createLocalVariablesInPlugin';

export const createLocalVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LOCAL_VARIABLES] = async (msg) => {
  const result = await createLocalVariablesInPlugin(msg.tokens, msg.settings);
  return {
    variableIds: result.allVariableCollectionIds,
    totalVariables: result.totalVariables,
  };
};
