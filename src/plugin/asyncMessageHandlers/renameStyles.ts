import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import renameStylesFromPlugin from '../renameStylesFromPlugin';

export const renameStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.RENAME_STYLES] = async (msg) => {
  try {
    return {
      styleIds: await renameStylesFromPlugin(msg.oldName, msg.newName, msg.parent),
    };
  } catch (e) {
    console.error(e);
  }

  return {
    styleIds: [],
  };
};
