import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ValuesProperty } from '@/figmaStorage/ValuesProperty';

export const syncSharedTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.SYNC_SHARED_TOKENS] = async () => {
  const sharedTokens = await ValuesProperty.read();
  return { sharedTokens: Object.values(sharedTokens || {}).flat() };
};
