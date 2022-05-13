import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import updateStyles from '../updateStyles';

export const createStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_STYLES] = async (msg) => {
  try {
    updateStyles(msg.tokens, true, msg.settings);
  } catch (e) {
    console.error(e);
  }
};
