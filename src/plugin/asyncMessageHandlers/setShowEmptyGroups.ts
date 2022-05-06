import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateUISettings } from '@/utils/uiSettings';

export const setShowEmptyGroups: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS] = async (msg) => {
  updateUISettings({
    showEmptyGroups: msg.showEmptyGroups,
  });
};
