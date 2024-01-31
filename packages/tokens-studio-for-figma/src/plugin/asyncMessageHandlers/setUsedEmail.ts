import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { UsedEmailProperty } from '@/figmaStorage/UsedEmailProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setUsedEmail: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_USED_EMAIL] = async (msg) => {
  await UsedEmailProperty.write(msg.email ?? null);
};
