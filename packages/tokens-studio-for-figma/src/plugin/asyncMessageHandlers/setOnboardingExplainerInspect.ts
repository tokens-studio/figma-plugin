import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { saveOnboardingExplainerInspect } from '../node';

export const setOnboardingExplainerInspect: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_ONBOARDINGEXPLAINERINSPECT] = async (msg) => {
  await saveOnboardingExplainerInspect(msg.onboardingExplainerInspect);
};
