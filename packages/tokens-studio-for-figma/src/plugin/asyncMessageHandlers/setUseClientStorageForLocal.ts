import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setUseClientStorageForLocal: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_USE_CLIENT_STORAGE_FOR_LOCAL] = async (msg) => {
  await figma.clientStorage.setAsync('useClientStorageForLocal', msg.value);
};
