import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ClientStorageProperty } from '@/figmaStorage/ClientStorageProperty';
import { getFileKey } from '../helpers';

export const updateCheckForChanges: AsyncMessageChannelHandlers[AsyncMessageTypes.UPDATE_CHECK_FOR_CHANGES] = async (msg) => {
  const fileKey = await getFileKey();
  await ClientStorageProperty.write('checkForChanges', fileKey, msg.checkForChanges as unknown as string);
};
