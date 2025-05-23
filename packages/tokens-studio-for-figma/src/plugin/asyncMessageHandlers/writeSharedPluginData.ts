import { MessageHandler } from '@/types/AsyncMessages';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { writeSharedPluginData as writeData } from '@/utils/figmaStorage/writeSharedPluginData';

export const writeSharedPluginData: MessageHandler<AsyncMessageTypes.WRITE_SHARED_PLUGIN_DATA> = async (msg) => {
  const { namespace, key, value } = msg;
  await writeData(namespace, key, value);
  return { type: AsyncMessageTypes.WRITE_SHARED_PLUGIN_DATA };
};