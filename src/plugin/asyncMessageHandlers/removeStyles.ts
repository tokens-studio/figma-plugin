import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import removeStylesFromPlugin from '../removeStylesFromPlugin';

export const removeStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_STYLES] = async (msg) => {
  try {
    return {
      styleIds: await removeStylesFromPlugin(msg.token),
    };
  } catch (e) {
    console.error(e);
  }

  return {
    styleIds: [],
  };
};
