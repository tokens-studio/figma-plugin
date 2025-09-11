import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { FileExportPreferencesProperty } from '@/figmaStorage';
import { getFileKey } from '../helpers';

export const getFileExportPreferences: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_FILE_EXPORT_PREFERENCES] = async () => {
  const fileKey = await getFileKey();
  const preferences = await FileExportPreferencesProperty.read(fileKey);
  return { type: AsyncMessageTypes.GET_FILE_EXPORT_PREFERENCES, ...preferences };
};
