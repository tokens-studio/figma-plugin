import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import createLocalVariablesFromSetsInPlugin from '../createLocalVariablesFromSetsInPlugin';

// This function is used to create variables based on token sets, without the use of themes
export const createLocalVariablesFromSets: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LOCAL_VARIABLES_FROM_SETS] = async (msg) => {
  const result = await createLocalVariablesFromSetsInPlugin(msg.tokens, msg.settings, msg.selectedSets);
  return {
    variableIds: result.allVariableCollectionIds,
    totalVariables: result.totalVariables,
  };
};
