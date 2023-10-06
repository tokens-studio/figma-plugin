import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { InitialLoadProperty } from '@/figmaStorage/InitialLoadProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setInitialLoad: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_INITIAL_LOAD] = async (msg) => {
  await InitialLoadProperty.write(msg.initialLoad);
};
