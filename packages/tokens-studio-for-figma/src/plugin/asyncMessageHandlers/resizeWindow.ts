import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const resizeWindow: AsyncMessageChannelHandlers[AsyncMessageTypes.RESIZE_WINDOW] = async (msg) => {
  figma.ui.resize(msg.width, msg.height);
};
