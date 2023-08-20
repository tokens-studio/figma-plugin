import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { MessageFromPluginTypes } from '@/types/messages';
import { postToUI } from '../notifiers';
import { defaultWorker } from '../Worker';

export const cancelOperation: AsyncMessageChannelHandlers[AsyncMessageTypes.CANCEL_OPERATION] = async () => {
  await postToUI({
    type: MessageFromPluginTypes.CLEAR_JOBS,
  });
  defaultWorker.cancel();
};
