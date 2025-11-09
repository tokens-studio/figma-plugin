import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { writeSharedPluginData } from '@/utils/figmaStorage/writeSharedPluginData';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';

export const setActiveExportTab: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_ACTIVE_EXPORT_TAB] = async (msg) => {
  await writeSharedPluginData(
    SharedPluginDataNamespaces.TOKENS,
    SharedPluginDataKeys[SharedPluginDataNamespaces.TOKENS].activeExportTab,
    msg.tab,
  );
};
