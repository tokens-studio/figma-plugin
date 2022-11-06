import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { saveOnboardingExplainerSets } from '../node';

export const setOnboardingExplainerSets: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSETS] = async (msg) => {
  await saveOnboardingExplainerSets(msg.onboardingExplainerSets);
};
