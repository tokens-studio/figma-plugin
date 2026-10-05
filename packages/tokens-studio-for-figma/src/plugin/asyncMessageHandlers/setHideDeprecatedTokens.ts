import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateUISettings } from '@/utils/uiSettings';

export const setHideDeprecatedTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_HIDE_DEPRECATED_TOKENS] = async (msg) => {
  updateUISettings({
    hideDeprecatedTokens: msg.hideDeprecatedTokens,
  });
};
