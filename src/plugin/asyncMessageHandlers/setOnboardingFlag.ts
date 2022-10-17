import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { saveOnboardingFlag } from '../node';

export const setOnboardingFlag: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_ONBOARDINGFLAG] = async (msg) => {
  await saveOnboardingFlag(msg.onboardingFlag);
};
