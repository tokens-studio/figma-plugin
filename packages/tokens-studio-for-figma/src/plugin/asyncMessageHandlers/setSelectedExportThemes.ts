import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { writeSharedPluginData } from '@/utils/figmaStorage/writeSharedPluginData';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';

export const setSelectedExportThemes: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_SELECTED_EXPORT_THEMES] = async (msg) => {
  await writeSharedPluginData(
    SharedPluginDataNamespaces.TOKENS,
    SharedPluginDataKeys[SharedPluginDataNamespaces.TOKENS].selectedExportThemes,
    msg.themes,
  );
};
