import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { LicenseKeyProperty } from '@/figmaStorage/LicenseKeyProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setLicenseKey: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_LICENSE_KEY] = async (msg) => {
  await LicenseKeyProperty.write(msg.licenseKey);
};
