import store from '../store';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { sendSelectionChange } from '../sendSelectionChange';

export const changedTabs: AsyncMessageChannelHandlers[AsyncMessageTypes.CHANGED_TABS] = async (msg) => {
  const { requiresSelectionValues } = msg;
  store.shouldSendSelectionValues = requiresSelectionValues;
  await sendSelectionChange();
};
