import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { LicenseKeyRemovedProperty } from '@/figmaStorage/LicenseKeyRemovedProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setInitialLoad: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_INITIAL_LOAD] = async (msg) => {
  await LicenseKeyRemovedProperty.write(msg.initialLoad);
};
