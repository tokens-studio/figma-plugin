import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { saveOnboardingExplainerExportSets } from '../node';

export const setOnboardingExplainerExportSets: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_ONBOARDINGEXPLAINEREXPORTSETS] = async (msg) => {
  await saveOnboardingExplainerExportSets(msg.onboardingExplainerExportSets);
};
