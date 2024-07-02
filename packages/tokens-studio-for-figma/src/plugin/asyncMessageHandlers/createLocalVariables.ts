import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import createLocalVariablesInPlugin from '../createLocalVariablesInPlugin';

// This function is used to create variables based on themes
export const createLocalVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LOCAL_VARIABLES] = async (msg) => {
  const result = await createLocalVariablesInPlugin(msg.tokens, msg.settings, msg.selectedThemes);
  return {
    variableIds: result.allVariableCollectionIds,
    totalVariables: result.totalVariables,
  };
};
