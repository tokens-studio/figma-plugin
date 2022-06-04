import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { goToNode } from '../node';

export const gotoNode: AsyncMessageChannelHandlers[AsyncMessageTypes.GOTO_NODE] = async (msg) => {
  goToNode(msg.id);
};
