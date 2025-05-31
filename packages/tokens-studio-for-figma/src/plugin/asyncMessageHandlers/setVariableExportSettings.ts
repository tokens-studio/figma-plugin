import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { writeSharedPluginData } from '@/utils/figmaStorage/writeSharedPluginData';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';

export const setVariableExportSettings: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_VARIABLE_EXPORT_SETTINGS] = async (msg) => {
  await writeSharedPluginData(
    SharedPluginDataNamespaces.TOKENS,
    SharedPluginDataKeys[SharedPluginDataNamespaces.TOKENS].variableExportSettings,
    msg.settings,
  );
};
