import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import createLocalVariablesWithoutModesInPlugin from '../createLocalVariablesWithoutModesInPlugin';

// This function is used to create variables based on token sets, without the use of themes
export const createLocalVariablesWithoutModes: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LOCAL_VARIABLES_WITHOUT_MODES] = async (msg) => {
  const result = await createLocalVariablesWithoutModesInPlugin(msg.tokens, msg.settings, msg.selectedSets);
  return {
    variableIds: result.allVariableCollectionIds,
    totalVariables: result.totalVariables,
  };
};
