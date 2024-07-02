import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { removeSingleCredential as removeSingleCredentialAsync } from '@/utils/credentials';

export const removeSingleCredential: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_SINGLE_CREDENTIAL] = async (msg) => {
  const { context } = msg;
  await removeSingleCredentialAsync(context);
};
