import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AuthDataProperty } from '@/figmaStorage/AuthDataProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setAuthData: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_AUTH_DATA] = async (msg) => {
  await AuthDataProperty.write(msg.auth);
};
