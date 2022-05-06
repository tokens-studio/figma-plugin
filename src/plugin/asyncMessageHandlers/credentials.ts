import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateCredentials } from '@/utils/credentials';

export const credentials: AsyncMessageChannelHandlers[AsyncMessageTypes.CREDENTIALS] = async (msg) => {
  const { type, ...context } = msg;
  await updateCredentials(context);
};
