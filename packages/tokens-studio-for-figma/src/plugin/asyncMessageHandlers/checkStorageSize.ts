import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { exceedsStorageLimit } from '@/utils/sizeCheck';

export const checkStorageSize: AsyncMessageChannelHandlers[AsyncMessageTypes.CHECK_STORAGE_SIZE] = async (msg) => {
  const { tokenValues } = msg;
  
  // Check if token values exceed the storage limit
  const isExceeded = exceedsStorageLimit(tokenValues);
  
  if (isExceeded) {
    // Set a flag to show warning
    await figma.clientStorage.setAsync('showStorageLimitWarning', true);
  }
  
  return {
    isExceeded,
  };
};
