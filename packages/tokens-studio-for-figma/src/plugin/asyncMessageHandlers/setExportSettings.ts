import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ExportSettingsProperty } from '@/figmaStorage';

export const setExportSettings: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_EXPORT_SETTINGS] = async (msg) => {
  await ExportSettingsProperty.write(msg.exportSettings);
};