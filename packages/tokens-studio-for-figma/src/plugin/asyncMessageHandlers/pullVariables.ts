import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import pullVariablesFn from '../pullVariables';

export const pullVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.PULL_VARIABLES] = async (msg) => {
  pullVariablesFn(msg.options, msg.themes, msg.proUser);
};
