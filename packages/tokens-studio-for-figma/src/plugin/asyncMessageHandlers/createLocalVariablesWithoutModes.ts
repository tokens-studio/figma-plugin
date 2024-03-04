import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import createLocalVariablesWithoutModesInPlugin from '../createLocalVariablesWithoutModesInPlugin';

export const createLocalVariablesWithoutModes: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LOCAL_VARIABLES_WITHOUT_MODES] = async (msg) => {
  const result = await createLocalVariablesWithoutModesInPlugin(msg.tokens, msg.settings);
  return {
    variableIds: result.allVariableCollectionIds,
    totalVariables: result.totalVariables,
  };
};
