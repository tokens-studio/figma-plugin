import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import removeStylesFromPlugin from '../removeStyles';

export const removeStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_STYLES] = async (msg) => {
  await removeStylesFromPlugin(msg.token);
};
