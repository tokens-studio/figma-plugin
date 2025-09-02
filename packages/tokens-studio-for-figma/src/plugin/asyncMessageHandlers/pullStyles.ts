import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import pullStylesFn from '../pullStyles';

export const pullStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.PULL_STYLES] = async (msg) => {
  try {
    await pullStylesFn(msg.styleTypes);
  } catch (error) {
    console.error('Error pulling styles:', error);
    // Notify the UI about the error
    figma.ui.postMessage({
      type: 'ERROR',
      message: 'Failed to import styles. Please check the console for details.',
    });
  }
};
