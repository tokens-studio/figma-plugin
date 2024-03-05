import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import syncStylesFn from '../syncStyles';

export const syncStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.SYNC_STYLES] = async (msg) => {
  try {
    const styleIds = await syncStylesFn(msg.tokens, msg.options, msg.settings);
    return {
      styleIdsToRemove: styleIds.styleIdsToRemove,
    };
  } catch (e) {
    console.error(e);
  }

  return {
    styleIdsToRemove: [],
  };
};
