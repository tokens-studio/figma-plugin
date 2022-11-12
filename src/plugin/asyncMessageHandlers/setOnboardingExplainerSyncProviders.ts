import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { saveOnboardingExplainerSyncProviders } from '../node';

export const setOnboardingExplainerSyncProviders: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSYNCPROVIDERS] = async (msg) => {
  await saveOnboardingExplainerSyncProviders(msg.onboardingExplainerSyncProviders);
};
