import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setLicenseKey: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_LICENSE_KEY] = async (msg) => {
  await figma.clientStorage.setAsync('licenseKey', msg.licenseKey);
};
