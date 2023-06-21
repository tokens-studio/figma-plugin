import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import syncVariablesFn from '../syncVariables';

export const syncVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.SYNC_VARIABLES] = async (msg) => {
  await syncVariablesFn(msg.tokens, msg.options, msg.settings);
};
