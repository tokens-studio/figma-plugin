import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { FileExportPreferencesProperty } from '@/figmaStorage';
import { getFileKey } from '../helpers';

export const setFileExportPreferences: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_FILE_EXPORT_PREFERENCES] = async (msg) => {
  const fileKey = await getFileKey();
  await FileExportPreferencesProperty.write(fileKey, msg.preferences);
};
