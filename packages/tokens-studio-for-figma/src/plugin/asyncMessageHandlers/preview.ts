import { AsyncMessageChannel, AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { startup } from '@/utils/plugin';
// import { notifyUI } from '../notifiers';

export const previewRequestStartup: AsyncMessageChannelHandlers[AsyncMessageTypes.PREVIEW_REQUEST_STARTUP] = async () => {
  const params = await startup();

  AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.STARTUP,
    ...params,
  });
  // notifyUI(msg.msg, msg.opts);
};
