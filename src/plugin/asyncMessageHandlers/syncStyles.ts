import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import syncStylesFn from '../syncStyles';

export const syncStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.SYNC_STYLES] = async (msg) => {
  syncStylesFn(msg.tokens);
};
