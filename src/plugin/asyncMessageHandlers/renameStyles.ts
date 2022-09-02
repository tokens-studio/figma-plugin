import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import renameStylesFromPlugin from '../renameStylesFromPlugin';

export const renameStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.RENAME_STYLES] = async (msg) => {
  await renameStylesFromPlugin(msg.oldName, msg.newName, msg.settings);
};
