import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import syncVariablesFn from '../syncVariables';

export const syncVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.SYNC_VARIABLES] = async (msg) => {
  try {
    const tokenNames = await syncVariablesFn(msg.options);
    return {
      renamedTokenNames: tokenNames.renamedTokenNames,
    };
  } catch (e) {
    console.error(e);
  }

  return {
    renamedTokenNames: [],
  };
};
