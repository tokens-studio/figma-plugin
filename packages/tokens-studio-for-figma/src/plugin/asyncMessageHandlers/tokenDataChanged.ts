import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const tokenDataChanged: AsyncMessageChannelHandlers[AsyncMessageTypes.TOKEN_DATA_CHANGED] = async () => {
  // This is a notification from plugin to UI, no response needed
};
