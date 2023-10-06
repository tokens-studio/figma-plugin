import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { LicenseKeyRemovedProperty } from '@/figmaStorage/LicenseKeyRemovedProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setLicenseKeyRemoved: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_LICENSE_KEY_REMOVED] = async (msg) => {
  await LicenseKeyRemovedProperty.write(msg.isLicenseKeyRemoved);
};
