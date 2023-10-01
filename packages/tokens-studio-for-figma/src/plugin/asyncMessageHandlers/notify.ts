import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { notifyUI } from '../notifiers';

export const notify: AsyncMessageChannelHandlers[AsyncMessageTypes.NOTIFY] = async (msg) => {
  notifyUI(msg.msg, msg.opts);
};
