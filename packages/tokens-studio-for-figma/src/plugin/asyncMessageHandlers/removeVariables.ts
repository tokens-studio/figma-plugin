import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import removeVariablesFromPlugin from '../removeVariablesFromPlugin';

export const removeVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_VARIABLES] = async (msg) => {
  try {
    return {
      variableIds: await removeVariablesFromPlugin(msg.variableKeys),
    };
  } catch (e) {
    console.error(e);
  }

  return {
    variableIds: [],
  };
};
