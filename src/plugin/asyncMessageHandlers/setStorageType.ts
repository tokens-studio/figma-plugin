import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { saveStorageType } from '../node';

export const setStorageType: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_STORAGE_TYPE] = async (msg) => {
  await saveStorageType(msg.storageType);
};
