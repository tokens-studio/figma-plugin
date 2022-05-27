import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import pullStylesFn from '../pullStyles';

export const pullStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.PULL_STYLES] = async (msg) => {
  pullStylesFn(msg.styleTypes);
};
